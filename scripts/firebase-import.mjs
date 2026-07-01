/**
 * firebase-import.mjs
 *
 * Pushes the exported backup into a new Firebase project.
 * Run AFTER switching your Firebase account and updating env.local.
 *
 * Usage:
 *   node scripts/firebase-import.mjs
 *
 * Reads:
 *   scripts/firebase-backup.json   — Firestore data from the export
 *   scripts/firebase-images/       — downloaded photo files from the export
 */

import { readFileSync, existsSync } from "fs";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, resolve, extname } from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Load env.local (should already point at the new Firebase project) ---
const envFile = readFileSync(resolve(__dirname, "../env.local"), "utf-8");
for (const line of envFile.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i > 0) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);
const storage = getStorage(app);

const BACKUP_PATH = resolve(__dirname, "firebase-backup.json");
const IMAGES_DIR = resolve(__dirname, "firebase-images");

if (!existsSync(BACKUP_PATH)) {
  console.error("Error: firebase-backup.json not found. Run firebase-export.mjs first.");
  process.exit(1);
}

const backup = JSON.parse(readFileSync(BACKUP_PATH, "utf-8"));
const originalImageMap = backup._imageMap ?? {}; // originalUrl -> localFilename

// --- Helpers ---

async function clearCollection(name) {
  const snap = await getDocs(collection(db, name));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  if (snap.size > 0) console.log(`  Cleared ${snap.size} existing docs from '${name}'`);
}

async function importCollection(name, docs) {
  await clearCollection(name);
  await Promise.all(
    docs.map(({ id, ...data }) => setDoc(doc(db, name, id), data))
  );
  console.log(`  Imported ${docs.length} docs into '${name}'`);
}

/** Uploads a local image file to Firebase Storage and returns the new download URL. */
async function uploadImage(localFilename, storagePath) {
  const localPath = resolve(IMAGES_DIR, localFilename);
  if (!existsSync(localPath)) {
    console.warn(`  Warning: local image not found: ${localFilename}`);
    return null;
  }
  const buffer = await readFile(localPath);
  const ext = extname(localFilename) || ".jpg";
  const storageRef = ref(storage, `${storagePath}/${Date.now()}-${localFilename}`);
  await uploadBytes(storageRef, buffer, { contentType: ext === ".png" ? "image/png" : "image/jpeg" });
  return getDownloadURL(storageRef);
}

// Build a map from old URL -> new URL as we re-upload images
const newUrlMap = {}; // oldUrl -> newUrl

async function remapUrl(oldUrl, storagePath, label) {
  if (!oldUrl) return undefined;
  if (newUrlMap[oldUrl]) return newUrlMap[oldUrl];

  const localFilename = originalImageMap[oldUrl];
  if (!localFilename) {
    // No local copy — keep the original URL (it may still be accessible)
    console.warn(`  Warning: no local file for ${label}, keeping original URL`);
    return oldUrl;
  }

  process.stdout.write(`  Uploading ${label}... `);
  const newUrl = await uploadImage(localFilename, storagePath);
  if (newUrl) {
    newUrlMap[oldUrl] = newUrl;
    console.log("done");
  } else {
    console.log("failed");
  }
  return newUrl ?? oldUrl;
}

// --- Main ---

console.log("\nImporting into Firebase project:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log();

// Re-upload photos first so we have new URLs before writing Firestore docs
console.log("Storage — re-uploading photos:");

for (const coach of backup.coaches) {
  if (coach.photoUrl) {
    coach.photoUrl = await remapUrl(coach.photoUrl, "coaches", `coach-${coach.id}`);
  }
}

for (const entry of backup.leadership) {
  if (entry.photoUrl) {
    entry.photoUrl = await remapUrl(entry.photoUrl, "leaders", `leader-${entry.id}`);
  }
}

for (const roster of backup.rosters) {
  if (!Array.isArray(roster.players)) continue;
  for (const player of roster.players) {
    if (player.imageUrl) {
      player.imageUrl = await remapUrl(player.imageUrl, `players/${roster.id}`, `player-${player.id}`);
    }
  }
}

// Write Firestore collections
console.log("\nFirestore:");
await importCollection("coaches", backup.coaches);
await importCollection("schedules", backup.schedules);
await importCollection("rosters", backup.rosters);
await importCollection("leadership", backup.leadership);

console.log("\nImport complete!\n");
process.exit(0);

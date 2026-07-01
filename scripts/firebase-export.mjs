/**
 * firebase-export.mjs
 *
 * Dumps all Firestore collections and downloads any Storage photos to disk.
 * Run BEFORE switching your Firebase account.
 *
 * Usage:
 *   node scripts/firebase-export.mjs
 *
 * Output:
 *   scripts/firebase-backup.json   — all Firestore data
 *   scripts/firebase-images/       — downloaded photo files
 */

import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, resolve, extname, basename } from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Load env.local ---
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

const IMAGES_DIR = resolve(__dirname, "firebase-images");
mkdirSync(IMAGES_DIR, { recursive: true });

// --- Helpers ---

async function exportCollection(name) {
  const snap = await getDocs(collection(db, name));
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log(`  Exported ${docs.length} docs from '${name}'`);
  return docs;
}

/** Downloads a URL to disk and returns the local filename. Returns null on failure. */
async function downloadImage(url, prefix) {
  if (!url || !url.startsWith("http")) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());

    // Derive a clean filename from the Storage path embedded in the URL
    // Firebase URLs look like: .../o/coaches%2F1234-photo.jpg?...
    let filename = prefix + "-" + Date.now();
    const match = decodeURIComponent(url).match(/\/o\/([^?]+)/);
    if (match) {
      // Replace path separators so it's a flat filename
      filename = match[1].replace(/\//g, "_");
    }
    // Ensure it has an extension
    if (!extname(filename)) filename += ".jpg";

    const localPath = resolve(IMAGES_DIR, filename);
    await writeFile(localPath, buffer);
    return filename;
  } catch (err) {
    console.warn(`    Warning: could not download image (${url.slice(0, 60)}...): ${err.message}`);
    return null;
  }
}

// --- Main ---

console.log("\nExporting from Firebase project:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log();

const backup = {};

// Firestore collections
console.log("Firestore:");
backup.coaches = await exportCollection("coaches");
backup.schedules = await exportCollection("schedules");
backup.rosters = await exportCollection("rosters");
backup.leadership = await exportCollection("leadership");

// Download photos — track original URL → local filename mapping
console.log("\nStorage photos:");
const imageMap = {}; // originalUrl -> localFilename

async function processUrl(url, label) {
  if (!url || imageMap[url] !== undefined) return;
  process.stdout.write(`  Downloading ${label}... `);
  const filename = await downloadImage(url, label.replace(/\s+/g, "-"));
  imageMap[url] = filename;
  console.log(filename ? `saved as ${filename}` : "skipped");
}

for (const coach of backup.coaches) {
  if (coach.photoUrl) await processUrl(coach.photoUrl, `coach-${coach.id}`);
}

for (const entry of backup.leadership) {
  if (entry.photoUrl) await processUrl(entry.photoUrl, `leader-${entry.id}`);
}

for (const roster of backup.rosters) {
  if (!Array.isArray(roster.players)) continue;
  for (const player of roster.players) {
    if (player.imageUrl) await processUrl(player.imageUrl, `player-${player.id}`);
  }
}

// Embed the imageMap in the backup so the import script knows which file = which URL
backup._imageMap = imageMap;

// Write backup JSON
const backupPath = resolve(__dirname, "firebase-backup.json");
writeFileSync(backupPath, JSON.stringify(backup, null, 2));

console.log(`\nBackup written to: ${backupPath}`);
console.log(`Images saved to:   ${IMAGES_DIR}/`);
console.log("\nDone. You can now switch your Firebase account.");
console.log("After updating env.local, run: node scripts/firebase-import.mjs\n");

process.exit(0);

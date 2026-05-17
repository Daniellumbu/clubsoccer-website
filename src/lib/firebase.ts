import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  limit,
  setDoc,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// --- Types ---

export interface Coach {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photoUrl?: string;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  imageUrl?: string;
  preferredPosition?: string;
  classes?: string;
  year?: number;
}

export interface ScheduleGame {
  id: string;
  /** ISO date string: YYYY-MM-DD */
  date: string;
  opponent: string;
  location: string;
  isHome: boolean;
  result?: string;
}

export interface Schedule {
  id: string;
  /** e.g. "2024-2025" */
  season: string;
  games: ScheduleGame[];
}

export interface Roster {
  id: string;
  /** e.g. "2024-2025" */
  season: string;
  players: Player[];
}

export interface LeadershipEntry {
  id: string;
  name: string;
  role: string;
  season: string;
  bio?: string;
  photoUrl?: string;
}

// --- Read helpers ---

export async function getCoach(): Promise<Coach | null> {
  const snap = await getDocs(query(collection(db, "coaches"), limit(1)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Coach;
}

export async function getCoaches(): Promise<Coach[]> {
  const snap = await getDocs(query(collection(db, "coaches"), orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coach));
}

export async function getSchedules(): Promise<Schedule[]> {
  const snap = await getDocs(query(collection(db, "schedules"), orderBy("season", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Schedule));
}

export async function getNextMatch(): Promise<ScheduleGame | null> {
  const today = new Date().toISOString().split("T")[0];
  const snap = await getDocs(query(collection(db, "schedules"), orderBy("season", "desc")));
  if (snap.empty) return null;
  const allGames: ScheduleGame[] = [];
  snap.docs.forEach((d) => {
    const s = d.data() as Omit<Schedule, "id">;
    allGames.push(...s.games);
  });
  const upcoming = allGames
    .filter((g) => g.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  return upcoming[0] ?? null;
}

export async function getRosters(): Promise<Roster[]> {
  const snap = await getDocs(query(collection(db, "rosters"), orderBy("season", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Roster));
}

export async function getLeadership(season?: string): Promise<LeadershipEntry[]> {
  const snap = await getDocs(query(collection(db, "leadership"), orderBy("season", "desc")));
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeadershipEntry));
  return season ? all.filter((e) => e.season === season) : all;
}

export async function getLeadershipSeasons(): Promise<string[]> {
  const snap = await getDocs(query(collection(db, "leadership"), orderBy("season", "desc")));
  return [...new Set(snap.docs.map((d) => (d.data() as LeadershipEntry).season))];
}

// --- Write helpers: Coach ---

export async function saveCoach(id: string | null, data: Omit<Coach, "id">): Promise<string> {
  if (id) {
    await setDoc(doc(db, "coaches", id), data);
    return id;
  }
  const ref = await addDoc(collection(db, "coaches"), data);
  return ref.id;
}

export async function deleteCoach(id: string): Promise<void> {
  await deleteDoc(doc(db, "coaches", id));
}

// --- Write helpers: Schedule (season-based) ---

export async function createScheduleSeason(season: string): Promise<string> {
  const ref = await addDoc(collection(db, "schedules"), { season, games: [] });
  return ref.id;
}

export async function deleteScheduleSeason(scheduleId: string): Promise<void> {
  await deleteDoc(doc(db, "schedules", scheduleId));
}

export async function addGameToSchedule(scheduleId: string, gameData: Omit<ScheduleGame, "id">): Promise<void> {
  const snap = await getDoc(doc(db, "schedules", scheduleId));
  if (!snap.exists()) throw new Error("Schedule not found");
  const schedule = snap.data() as Omit<Schedule, "id">;
  const game: ScheduleGame = stripUndefined({ ...gameData, id: `g-${Date.now()}` });
  await setDoc(doc(db, "schedules", scheduleId), { ...schedule, games: [...schedule.games, game] });
}

export async function updateGameInSchedule(scheduleId: string, gameId: string, data: Omit<ScheduleGame, "id">): Promise<void> {
  const snap = await getDoc(doc(db, "schedules", scheduleId));
  if (!snap.exists()) throw new Error("Schedule not found");
  const schedule = snap.data() as Omit<Schedule, "id">;
  const games = schedule.games.map((g: ScheduleGame) =>
    g.id === gameId ? stripUndefined({ ...data, id: gameId }) : g
  );
  await setDoc(doc(db, "schedules", scheduleId), { ...schedule, games });
}

export async function removeGameFromSchedule(scheduleId: string, gameId: string): Promise<void> {
  const snap = await getDoc(doc(db, "schedules", scheduleId));
  if (!snap.exists()) throw new Error("Schedule not found");
  const schedule = snap.data() as Omit<Schedule, "id">;
  const games = schedule.games.filter((g: ScheduleGame) => g.id !== gameId);
  await setDoc(doc(db, "schedules", scheduleId), { ...schedule, games });
}

// Firestore rejects undefined values, so strip them before writing
function stripUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

// --- Write helpers: Roster / Players ---

export async function createSeason(season: string): Promise<string> {
  const ref = await addDoc(collection(db, "rosters"), { season, players: [] });
  return ref.id;
}

export async function addPlayerToRoster(
  rosterId: string,
  playerData: Omit<Player, "id">
): Promise<void> {
  const snap = await getDoc(doc(db, "rosters", rosterId));
  if (!snap.exists()) throw new Error("Roster not found");
  const roster = snap.data() as Omit<Roster, "id">;
  const player: Player = stripUndefined({ ...playerData, id: `p-${Date.now()}` });
  await setDoc(doc(db, "rosters", rosterId), {
    ...roster,
    players: [...roster.players, player],
  });
}

export async function updatePlayerInRoster(
  rosterId: string,
  playerId: string,
  data: Omit<Player, "id">
): Promise<void> {
  const snap = await getDoc(doc(db, "rosters", rosterId));
  if (!snap.exists()) throw new Error("Roster not found");
  const roster = snap.data() as Omit<Roster, "id">;
  const players = roster.players.map((p: Player) =>
    p.id === playerId ? stripUndefined({ ...data, id: playerId }) : p
  );
  await setDoc(doc(db, "rosters", rosterId), { ...roster, players });
}

export async function removePlayerFromRoster(
  rosterId: string,
  playerId: string
): Promise<void> {
  const snap = await getDoc(doc(db, "rosters", rosterId));
  if (!snap.exists()) throw new Error("Roster not found");
  const roster = snap.data() as Omit<Roster, "id">;
  const players = roster.players.filter((p: Player) => p.id !== playerId);
  await setDoc(doc(db, "rosters", rosterId), { ...roster, players });
}

export async function deleteRoster(rosterId: string): Promise<void> {
  await deleteDoc(doc(db, "rosters", rosterId));
}

export async function uploadCoachPhoto(file: File | Blob, fileName = "photo.jpg"): Promise<string> {
  const name = file instanceof File ? file.name : fileName;
  const storageRef = ref(storage, `coaches/${Date.now()}-${name}`);
  const upload = uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef));
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Upload timed out. Check Firebase Storage configuration.")), 15000)
  );
  return Promise.race([upload, timeout]);
}

export async function uploadLeaderPhoto(file: File | Blob, fileName = "photo.jpg"): Promise<string> {
  const name = file instanceof File ? file.name : fileName;
  const storageRef = ref(storage, `leaders/${Date.now()}-${name}`);
  const upload = uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef));
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Upload timed out. Check Firebase Storage configuration.")), 15000)
  );
  return Promise.race([upload, timeout]);
}

export async function uploadPlayerImage(file: File | Blob, rosterId: string, fileName = "photo.jpg"): Promise<string> {
  const name = file instanceof File ? file.name : fileName;
  const storageRef = ref(storage, `players/${rosterId}/${Date.now()}-${name}`);
  const upload = uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef));
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Image upload timed out. Make sure Firebase Storage is enabled in your project and the security rules allow writes.")), 15000)
  );
  return Promise.race([upload, timeout]);
}

export async function importRoster(fromRosterId: string, toSeason: string): Promise<string> {
  const snap = await getDoc(doc(db, "rosters", fromRosterId));
  if (!snap.exists()) throw new Error("Source roster not found");
  const sourceRoster = snap.data() as Omit<Roster, "id">;
  // Drop year-4 players (graduating) and increment everyone else's year by 1
  const filteredPlayers = sourceRoster.players
    .filter((p: Player) => !p.year || p.year < 4)
    .map((p: Player, i: number) => ({
      ...p,
      id: `p-${Date.now()}-${i}`,
      ...(p.year ? { year: p.year + 1 } : {}),
    }));
  const docRef = await addDoc(collection(db, "rosters"), { season: toSeason, players: filteredPlayers });
  return docRef.id;
}

// --- Write helpers: Leadership ---

export async function addLeadershipEntry(data: Omit<LeadershipEntry, "id">): Promise<void> {
  await addDoc(collection(db, "leadership"), stripUndefined(data));
}

export async function updateLeadershipEntry(
  id: string,
  data: Omit<LeadershipEntry, "id">
): Promise<void> {
  await setDoc(doc(db, "leadership", id), stripUndefined(data));
}

export async function deleteLeadershipEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, "leadership", id));
}

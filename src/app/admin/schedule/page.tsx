"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getSchedules,
  createScheduleSeason,
  deleteScheduleSeason,
  addGameToSchedule,
  updateGameInSchedule,
  removeGameFromSchedule,
  type Schedule,
  type ScheduleGame,
} from "@/lib/firebase";
import { SCHOOLS, findSchool, HOME_LOCATION, type School } from "@/lib/schools";

type GameFormData = Omit<ScheduleGame, "id">;

const emptyGame: GameFormData = { date: "", opponent: "", location: HOME_LOCATION, isHome: true, result: "" };

const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carleton-blue w-full";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function GameForm({ form, setForm, onSubmit, onCancel, label, saving, error }: {
  form: GameFormData;
  setForm: (f: GameFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  label: string;
  saving: boolean;
  error: string | null;
}) {
  const [query, setQuery] = useState(form.opponent);
  const [open, setOpen] = useState(false);

  const suggestions: School[] = query.length > 0
    ? SCHOOLS.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 7)
    : [];

  function selectSchool(school: School) {
    setQuery(school.name);
    setForm({ ...form, opponent: school.name, location: form.isHome ? HOME_LOCATION : school.location });
    setOpen(false);
  }

  function handleOpponentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setForm({ ...form, opponent: val });
  }

  function setHomeAway(isHome: boolean) {
    const school = findSchool(form.opponent);
    if (isHome) {
      setForm({ ...form, isHome: true, location: HOME_LOCATION });
    } else {
      setForm({ ...form, isHome: false, location: school?.location ?? "" });
    }
  }

  const school = findSchool(form.opponent);
  const needsCustomLocation = !form.isHome && !school;

  return (
    <form onSubmit={onSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
        </div>
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-1">Opponent</label>
          <input
            required
            value={query}
            onChange={handleOpponentChange}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            className={inputCls}
            placeholder="Search for a school…"
            autoComplete="off"
          />
          {open && suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectSchool(s); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.logo} alt={s.name} className="w-7 h-7 object-contain flex-shrink-0" />
                  <span className="text-sm text-gray-800">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Location</label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setHomeAway(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              form.isHome
                ? "bg-carleton-blue text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setHomeAway(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !form.isHome
                ? "bg-carleton-blue text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Away
          </button>
        </div>
        {needsCustomLocation ? (
          <input
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className={inputCls}
            placeholder="Away field address"
          />
        ) : (
          <p className="text-xs text-gray-400 mt-1">{form.location}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Result (optional)</label>
        <input value={form.result ?? ""} onChange={(e) => setForm({ ...form, result: e.target.value })} className={inputCls} placeholder="W 2-1" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="bg-carleton-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
          {saving ? "Saving…" : label}
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<GameFormData>(emptyGame);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<GameFormData>(emptyGame);
  const [newSeason, setNewSeason] = useState("");
  const [showNewSeason, setShowNewSeason] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const data = await getSchedules();
    setSchedules(data);
    if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const schedule = schedules.find((s) => s.id === selectedId) ?? null;
  const games = schedule?.games.slice().sort((a, b) => a.date.localeCompare(b.date)) ?? [];

  function startEdit(game: ScheduleGame) {
    setEditingId(game.id);
    setEditForm({ date: game.date, opponent: game.opponent, location: game.location, isHome: game.isHome, result: game.result ?? "" });
    setShowAdd(false);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !selectedId) return;
    setSaving(true);
    setError(null);
    try {
      const data = { ...editForm };
      if (!data.result) delete data.result;
      await updateGameInSchedule(selectedId, editingId, data);
      setEditingId(null);
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      const data = { ...addForm };
      if (!data.result) delete data.result;
      await addGameToSchedule(selectedId, data);
      setShowAdd(false);
      setAddForm(emptyGame);
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(gameId: string, opponent: string) {
    if (!selectedId || !confirm(`Remove game vs ${opponent}?`)) return;
    try {
      await removeGameFromSchedule(selectedId, gameId);
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  }

  async function handleCreateSeason(e: React.FormEvent) {
    e.preventDefault();
    if (!newSeason.trim()) return;
    setSaving(true);
    try {
      const id = await createScheduleSeason(newSeason.trim());
      setNewSeason("");
      setShowNewSeason(false);
      await load();
      setSelectedId(id);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSeason() {
    if (!schedule || !confirm(`Delete the entire ${schedule.season} schedule? This cannot be undone.`)) return;
    try {
      await deleteScheduleSeason(selectedId);
      const remaining = schedules.filter((s) => s.id !== selectedId);
      setSelectedId(remaining[0]?.id || "");
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/admin" className="text-sm text-gray-400 hover:text-carleton-blue transition-colors mb-6 inline-block">
        ← Admin
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Schedule</h1>
        <div className="flex items-center gap-3">
          {schedules.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setEditingId(null); setShowAdd(false); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carleton-blue bg-white"
              >
                {schedules.map((s) => <option key={s.id} value={s.id}>{s.season}</option>)}
              </select>
              <button
                onClick={handleDeleteSeason}
                className="border border-red-200 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          )}
          <button
            onClick={() => setShowNewSeason(!showNewSeason)}
            className="border border-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            + Season
          </button>
        </div>
      </div>

      {showNewSeason && (
        <form onSubmit={handleCreateSeason} className="flex gap-3 mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <input
            required
            value={newSeason}
            onChange={(e) => setNewSeason(e.target.value)}
            placeholder="2026-2027"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carleton-blue flex-1"
          />
          <button type="submit" disabled={saving} className="bg-carleton-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {saving ? "Creating…" : "Create"}
          </button>
          <button type="button" onClick={() => { setShowNewSeason(false); setNewSeason(""); }} className="border border-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
            Cancel
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {!loading && schedules.length === 0 && (
        <p className="text-gray-400 text-sm">No seasons yet. Create one above.</p>
      )}

      {!loading && schedule && (
        <>
          <div className="space-y-3 mb-6">
            {games.length === 0 && <p className="text-gray-400 text-sm">No games yet. Add one below.</p>}
            {games.map((game) =>
              editingId === game.id ? (
                <GameForm
                  key={game.id}
                  form={editForm}
                  setForm={setEditForm}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditingId(null)}
                  label="Save Changes"
                  saving={saving}
                  error={error}
                />
              ) : (
                <div key={game.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-3 shadow-sm gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-sm text-gray-400 flex-shrink-0">{formatDate(game.date)}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      {(() => {
                        const s = findSchool(game.opponent);
                        return s ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.logo} alt={s.name} className="w-7 h-7 object-contain flex-shrink-0" />
                        ) : null;
                      })()}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">vs. {game.opponent}</p>
                        <p className="text-xs text-gray-400 truncate">{game.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${game.isHome ? "bg-carleton-maize/20 text-carleton-blue" : "bg-gray-100 text-gray-500"}`}>
                      {game.isHome ? "Home" : "Away"}
                    </span>
                    {game.result && <span className="text-sm font-mono font-bold text-gray-700">{game.result}</span>}
                    <button onClick={() => startEdit(game)} className="text-sm text-carleton-blue hover:opacity-70 transition-opacity">Edit</button>
                    <button onClick={() => handleDelete(game.id, game.opponent)} className="text-sm text-red-400 hover:text-red-600 transition-colors">✕</button>
                  </div>
                </div>
              )
            )}
          </div>

          {showAdd ? (
            <GameForm
              key="add"
              form={addForm}
              setForm={setAddForm}
              onSubmit={handleAdd}
              onCancel={() => { setShowAdd(false); setAddForm(emptyGame); }}
              label="Add Game"
              saving={saving}
              error={error}
            />
          ) : (
            <button
              onClick={() => { setShowAdd(true); setEditingId(null); }}
              className="bg-carleton-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              + Add Game
            </button>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSchedules, getSchools, updateGameInSchedule, type Schedule, type ScheduleGame } from "@/lib/firebase";
import { findSchool, type School } from "@/lib/schools";

const today = new Date().toISOString().split("T")[0];

type Outcome = "win" | "loss" | "tie";

interface ResultFormData {
  result: string;
  outcome: Outcome | "";
  summary: string;
  boxScore: string;
  livestreamUrl: string;
}

const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carleton-blue w-full";

const OUTCOME_STYLES: Record<Outcome, string> = {
  win: "bg-green-600 text-white",
  loss: "bg-red-600 text-white",
  tie: "bg-gray-500 text-white",
};

const RESULT_TEXT_COLOR: Record<Outcome, string> = {
  win: "text-green-600",
  loss: "text-red-600",
  tie: "text-gray-500",
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toFormData(game: ScheduleGame): ResultFormData {
  return {
    result: game.result ?? "",
    outcome: game.outcome ?? "",
    summary: game.summary ?? "",
    boxScore: game.boxScore ?? "",
    livestreamUrl: game.livestreamUrl ?? "",
  };
}

export default function AdminResultsPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ResultFormData>({ result: "", outcome: "", summary: "", boxScore: "", livestreamUrl: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [data, schoolData] = await Promise.all([getSchedules(), getSchools()]);
      setSchedules(data);
      setSchools(schoolData);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const schedule = schedules.find((s) => s.id === selectedId) ?? null;
  const pastGames = (schedule?.games ?? [])
    .filter((g) => g.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  function startEdit(game: ScheduleGame) {
    setEditingId(game.id);
    setEditForm(toFormData(game));
    setError(null);
  }

  async function handleSave(e: React.FormEvent, game: ScheduleGame) {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.result.trim() || !editForm.outcome) {
      setError("Score and outcome (Win/Loss/Tie) are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateGameInSchedule(selectedId, game.id, {
        date: game.date,
        opponent: game.opponent,
        location: game.location,
        isHome: game.isHome,
        result: editForm.result.trim(),
        outcome: editForm.outcome,
        summary: editForm.summary.trim() || undefined,
        boxScore: editForm.boxScore.trim() || undefined,
        livestreamUrl: editForm.livestreamUrl.trim() || undefined,
      });
      setEditingId(null);
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/admin" className="text-sm text-gray-400 hover:text-carleton-blue transition-colors mb-6 inline-block">
        ← Admin
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="text-4xl font-bold text-gray-900">Results</h1>
        {schedules.length > 0 && (
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setEditingId(null); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carleton-blue bg-white"
          >
            {schedules.map((s) => <option key={s.id} value={s.id}>{s.season}</option>)}
          </select>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Add a score, recap, box score, and livestream link for games that have already been played. Leave any field blank to hide it on the schedule page.
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {!loading && schedules.length === 0 && (
        <p className="text-gray-400 text-sm">No seasons yet. Add games under Schedule first.</p>
      )}

      {!loading && schedule && pastGames.length === 0 && (
        <p className="text-gray-400 text-sm">No past games in this season yet.</p>
      )}

      {!loading && schedule && pastGames.length > 0 && (
        <div className="space-y-3">
          {pastGames.map((game) => {
            const school = findSchool(schools, game.opponent);
            const hasDetails = Boolean(game.result || game.summary || game.boxScore || game.livestreamUrl);

            if (editingId === game.id) {
              return (
                <form
                  key={game.id}
                  onSubmit={(e) => handleSave(e, game)}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    {school && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={school.logo} alt={school.name} className="w-10 h-10 object-contain flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">vs. {game.opponent}</p>
                      <p className="text-xs text-gray-400">{formatDate(game.date)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Outcome</label>
                    <div className="flex gap-2">
                      {(["win", "loss", "tie"] as const).map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, outcome: o })}
                          className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                            editForm.outcome === o
                              ? OUTCOME_STYLES[o]
                              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Score</label>
                    <input
                      required
                      value={editForm.result}
                      onChange={(e) => setEditForm({ ...editForm, result: e.target.value })}
                      className={inputCls}
                      placeholder="5-4"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Recap (optional)</label>
                    <textarea
                      value={editForm.summary}
                      onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                      rows={3}
                      className={inputCls}
                      placeholder="Short summary of how the game went…"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Box Score (optional)</label>
                    <textarea
                      value={editForm.boxScore}
                      onChange={(e) => setEditForm({ ...editForm, boxScore: e.target.value })}
                      rows={2}
                      className={inputCls}
                      placeholder="e.g. Fallone, Gianluca — 23', Nicholas, Will — 67'"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Livestream Link (optional)</label>
                    <input
                      type="url"
                      value={editForm.livestreamUrl}
                      onChange={(e) => setEditForm({ ...editForm, livestreamUrl: e.target.value })}
                      className={inputCls}
                      placeholder="https://…"
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="bg-carleton-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div key={game.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-3 shadow-sm gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-sm text-gray-400 flex-shrink-0">{formatDate(game.date)}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    {school && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={school.logo} alt={school.name} className="w-10 h-10 object-contain flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">vs. {game.opponent}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {game.result ? (
                          <span className={`font-semibold ${game.outcome ? RESULT_TEXT_COLOR[game.outcome] : ""}`}>{game.result}</span>
                        ) : (
                          "No score recorded"
                        )}
                        {(game.summary || game.boxScore) ? " · has recap" : ""}
                      </p>
                    </div>
                  </div>
                </div>
                <button onClick={() => startEdit(game)} className="text-sm text-carleton-blue hover:opacity-70 transition-opacity flex-shrink-0">
                  {hasDetails ? "Edit" : "+ Add Details"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

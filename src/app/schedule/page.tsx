"use client";

import { useEffect, useState } from "react";
import { getSchedules, type Schedule } from "@/lib/firebase";
import { MatchRow } from "@/components/ui/MatchRow";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[] | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    getSchedules()
      .then((data) => {
        setSchedules(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch((err) => {
        console.error("[schedule]", err);
        setError(err?.message ?? "Failed to load schedule.");
        setSchedules([]);
      });
  }, []);

  const schedule = schedules?.find((s) => s.id === selectedId) ?? null;
  const games = schedule?.games.slice().sort((a, b) => a.date.localeCompare(b.date)) ?? [];
  const upcoming = games.filter((g) => g.date >= today);
  const past = games.filter((g) => g.date < today).reverse();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Schedule</h1>
        {schedules && schedules.length > 1 && (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carleton-blue bg-white"
          >
            {schedules.map((s) => <option key={s.id} value={s.id}>{s.season}</option>)}
          </select>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-mono">
          {error}
        </div>
      )}

      {schedules === undefined && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {schedules?.length === 0 && !error && (
        <p className="text-gray-400 text-sm">No schedule available yet.</p>
      )}

      {schedule && games.length === 0 && (
        <p className="text-gray-400 text-sm">No games in this season yet.</p>
      )}

      {schedule && games.length > 0 && (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((game) => <MatchRow key={game.id} game={game} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Results</h2>
              <div className="space-y-3">
                {past.map((game) => <MatchRow key={game.id} game={game} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

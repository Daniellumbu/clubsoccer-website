"use client";

import { useEffect, useState } from "react";
import { getLeadership, type LeadershipEntry } from "@/lib/firebase";

const ROLE_ORDER = [
  "Club President",
  "Club Vice President",
  "Club Treasurer",
  "Captain",
  "Social Captain",
  "Freshman Liaison",
  "Campus OutReach Manager",
];

const ROLE_DESCRIPTIONS: Record<string, string> = {
  "Club President": "Leads the club, oversees all operations, and serves as the primary point of contact with the college.",
  "Club Vice President": "Supports the President and steps in as needed to keep the club running smoothly.",
  "Club Treasurer": "Manages club finances, dues collection, and budget planning.",
  "Captain": "Helps with scheduling games and finalizing game rosters. Runs practice and coordinates with Social Captains to keep camaraderie high.",
  "Social Captain": "Plans team social events, builds team culture, and keeps morale strong on and off the field.",
  "Freshman Liaison": "Bridges new members with the rest of the club and helps freshmen feel at home.",
  "Campus OutReach Manager": "Promotes the club across campus and coordinates recruitment and community engagement.",
};

function roleIndex(role: string) {
  const i = ROLE_ORDER.indexOf(role);
  return i === -1 ? ROLE_ORDER.length : i;
}

export default function LeadershipPage() {
  const [entries, setEntries] = useState<LeadershipEntry[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeadership()
      .then((all) => {
        setEntries(all);
        // Seasons are ordered desc by the query — pick the first unique one as default
        const first = all[0]?.season;
        if (first) setSelectedSeason(first);
      })
      .catch((err) => {
        console.error("[leadership]", err);
        setError(err?.message ?? "Failed to load leadership.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Derive the unique ordered season list from entries (entries are already season-desc ordered)
  const seasons = [...new Set(entries.map((e) => e.season))];

  const visible = entries
    .filter((e) => e.season === selectedSeason)
    .sort((a, b) => roleIndex(a.role) - roleIndex(b.role));

  // Group by role so co-captains / co-social-caps appear together
  const grouped: Record<string, LeadershipEntry[]> = {};
  for (const entry of visible) {
    (grouped[entry.role] ??= []).push(entry);
  }
  const orderedRoles = Object.keys(grouped).sort((a, b) => roleIndex(a) - roleIndex(b));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Leadership</h1>

        {seasons.length > 1 && (
          <div className="flex items-center gap-2">
            <label htmlFor="season" className="text-sm text-gray-500 font-medium">Season</label>
            <select
              id="season"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-carleton-blue"
            >
              {seasons.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-mono">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && visible.length === 0 && !error && (
        <p className="text-gray-400 text-sm">No leadership listed for this season.</p>
      )}

      <div className="space-y-6">
        {orderedRoles.map((role) => (
          <div key={role} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-carleton-blue">{role}</h2>
              {ROLE_DESCRIPTIONS[role] && (
                <p className="text-sm text-gray-400 mt-1 leading-relaxed">{ROLE_DESCRIPTIONS[role]}</p>
              )}
            </div>
            <div className="space-y-3">
              {grouped[role].map((entry) => (
                <div key={entry.id} className="flex items-center gap-3">
                  {entry.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.photoUrl} alt={entry.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <span className="w-12 h-12 flex items-center justify-center rounded-full bg-carleton-blue text-carleton-maize font-bold flex-shrink-0">
                      {entry.name.charAt(0)}
                    </span>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{entry.name}</p>
                    {entry.bio && <p className="text-sm text-gray-500 mt-0.5">{entry.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

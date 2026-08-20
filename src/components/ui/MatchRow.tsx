"use client";

import { useState } from "react";
import Image from "next/image";
import type { ScheduleGame } from "@/lib/firebase";
import { findSchool } from "@/lib/schools";

interface MatchRowProps {
  game: ScheduleGame;
}

const OUTCOME_COLORS = {
  win: { border: "border-l-green-500", pill: "bg-green-100 text-green-700" },
  loss: { border: "border-l-red-500", pill: "bg-red-100 text-red-700" },
  tie: { border: "border-l-gray-400", pill: "bg-gray-100 text-gray-600" },
} as const;

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function MatchRow({ game }: MatchRowProps) {
  const [expanded, setExpanded] = useState(false);
  const school = findSchool(game.opponent);
  const hasDetails = Boolean(game.summary || game.boxScore || game.livestreamUrl);
  const outcomeColor = game.outcome ? OUTCOME_COLORS[game.outcome] : null;

  return (
    <div className={`bg-white border border-gray-100 border-l-4 ${outcomeColor?.border ?? "border-l-carleton-blue"} rounded-xl shadow-sm overflow-hidden`}>
      <button
        type="button"
        onClick={() => hasDetails && setExpanded((v) => !v)}
        className={`w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 text-left ${
          hasDetails ? "cursor-pointer hover:bg-carleton-blue/5 transition-colors" : "cursor-default"
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-400 w-24 flex-shrink-0">
            {formatDate(game.date)}
          </span>
          <div className="flex items-center gap-3">
            {school ? (
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <Image
                  src={school.logo}
                  alt={school.name}
                  width={40}
                  height={40}
                  className="object-contain max-h-10"
                />
              </div>
            ) : (
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-sm font-bold">
                {game.opponent.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">vs. {game.opponent}</p>
              <p className="text-sm text-gray-500">{game.location}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:flex-shrink-0">
          <span
            className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full ${
              game.isHome
                ? "bg-carleton-maize/20 text-carleton-blue"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {game.isHome ? "Home" : "Away"}
          </span>
          {game.result && (
            <span
              className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${
                outcomeColor ? outcomeColor.pill : "text-gray-900"
              }`}
            >
              {game.result}
            </span>
          )}
          {hasDetails && (
            <span className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}>
              ▾
            </span>
          )}
        </div>
      </button>

      {hasDetails && expanded && (
        <div className="border-t-2 border-carleton-blue/15 bg-carleton-blue/5 px-5 py-5 grid sm:grid-cols-2 gap-4">
          {game.summary && (
            <div className="bg-white border-t-4 border-carleton-blue rounded-lg p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-carleton-blue mb-2">
                Recap
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{game.summary}</p>
            </div>
          )}
          {(game.boxScore || game.livestreamUrl) && (
            <div className="bg-white border-t-4 border-carleton-blue rounded-lg p-4 shadow-sm space-y-4">
              {game.boxScore && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-carleton-blue mb-2">
                    Box Score
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{game.boxScore}</p>
                </div>
              )}
              {game.livestreamUrl && (
                <a
                  href={game.livestreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-carleton-maize text-carleton-blue font-semibold text-sm px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
                >
                  Watch Livestream →
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

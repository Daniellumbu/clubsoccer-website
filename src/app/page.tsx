"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getNextMatch, type ScheduleGame } from "@/lib/firebase";
import { MatchRow } from "@/components/ui/MatchRow";

export default function HomePage() {
  const [nextMatch, setNextMatch] = useState<ScheduleGame | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNextMatch()
      .then(setNextMatch)
      .catch((err) => {
        console.error("[home/nextMatch]", err);
        setError(err?.message ?? "Failed to load next match.");
        setNextMatch(null);
      });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[75vh] flex items-center justify-center text-center overflow-hidden">
        <Image
          src="/backgroungImage1.JPG"
          alt="Carleton Club Soccer team"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-carleton-blue/70" />
        <div className="relative z-10 px-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-carleton-maize mb-3">
            Carleton College
          </p>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-5">
            Club Soccer
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Schedules, roster, and season stats for Carleton&apos;s club soccer team.
          </p>
        </div>
      </section>

      {/* Next Match */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-16 max-w-3xl">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-4">
            Next Match
          </h2>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-mono">
              {error}
            </div>
          )}
          {nextMatch === undefined && !error && (
            <div className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          )}
          {nextMatch === null && !error && (
            <p className="text-gray-400 text-sm">No upcoming matches scheduled.</p>
          )}
          {nextMatch && <MatchRow game={nextMatch} />}
        </section>
      </div>

      {/* Roster teaser */}
      <section className="relative h-72 flex items-center justify-center overflow-hidden">
        <Image
          src="/backgroundimage2.png"
          alt="Carleton Club Soccer fall season"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gray-900/65" />
        <div className="relative z-10 text-center px-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-carleton-maize mb-2">
            Meet the Team
          </p>
          <h2 className="text-3xl font-bold text-white mb-5">See the Full Roster</h2>
          <Link
            href="/rosters"
            className="inline-block bg-carleton-maize text-carleton-blue font-semibold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            View Roster →
          </Link>
        </div>
      </section>
    </div>
  );
}

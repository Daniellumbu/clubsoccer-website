"use client";

import { useEffect, useState } from "react";
import { getCoaches, type Coach } from "@/lib/firebase";
import { CoachCard } from "@/components/ui/CoachCard";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCoaches()
      .then(setCoaches)
      .catch((err) => {
        console.error("[coaches]", err);
        setError(err?.message ?? "Failed to load coaches.");
        setCoaches([]);
      });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Coaches</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-mono">
          {error}
        </div>
      )}

      {coaches === undefined && (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse max-w-xl" />
          ))}
        </div>
      )}

      {coaches?.length === 0 && !error && (
        <p className="text-gray-400 text-sm">No coaches listed yet.</p>
      )}

      {coaches && coaches.length > 0 && (
        <div className="space-y-4">
          {coaches.map((coach) => <CoachCard key={coach.id} coach={coach} />)}
        </div>
      )}
    </div>
  );
}

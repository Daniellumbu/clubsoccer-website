import Image from "next/image";
import type { ScheduleGame } from "@/lib/firebase";
import { findSchool } from "@/lib/schools";

interface MatchRowProps {
  game: ScheduleGame;
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function MatchRow({ game }: MatchRowProps) {
  const school = findSchool(game.opponent);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm">
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
          <span className="text-sm font-mono font-bold text-gray-900">{game.result}</span>
        )}
      </div>
    </div>
  );
}

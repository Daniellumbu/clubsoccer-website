import type { Player } from "@/lib/firebase";

const YEAR_LABELS: Record<number, string> = { 1: "Freshman", 2: "Sophomore", 3: "Junior", 4: "Senior" };

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
      {player.imageUrl ? (
        <img
          src={player.imageUrl}
          alt={player.name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <span className="w-12 h-12 flex items-center justify-center rounded-full bg-carleton-blue text-carleton-maize font-bold text-sm flex-shrink-0">
          {player.number}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 truncate">{player.name}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="uppercase tracking-wider">{player.position}</span>
          {player.year && <span>• {YEAR_LABELS[player.year] ?? `Year ${player.year}`}</span>}
        </div>
      </div>
    </div>
  );
}

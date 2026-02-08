"use client";
import { Player, calculateOverall } from "../data/mocks";
import { Trophy } from "lucide-react";

export default function RankingList({ players }: { players: Player[] }) {
  const sortedPlayers = [...players].sort((a, b) => 
    calculateOverall(b.currentStats) - calculateOverall(a.currentStats)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-[fadeIn_0.3s_ease-in-out]">
      {sortedPlayers.map((player, index) => {
        const overall = calculateOverall(player.currentStats);
        return (
          <div 
            key={player.id} 
            className="flex items-center p-3 rounded-lg border shadow-sm relative overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            {/* Medalha/Posição */}
            <div className={`w-8 font-black text-xl italic z-10 ${index < 3 ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] opacity-50'}`}>
              #{index + 1}
            </div>
            
            <div className="flex-1 ml-2 z-10">
              <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{player.name}</div>
              <div className="text-[10px] opacity-70 flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                <span>F: {player.currentStats.fisico}</span>
                <span>H: {player.currentStats.habilidade}</span>
                <span>D: {player.currentStats.defesa}</span>
              </div>
            </div>

            <div className="text-xl font-black z-10" style={{ color: 'var(--accent)' }}>
               {overall}
            </div>

            {/* Efeito de Destaque para Top 3 */}
            {index < 3 && (
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--accent)] to-transparent opacity-10 pointer-events-none"/>
            )}
          </div>
        );
      })}
    </div>
  );
}
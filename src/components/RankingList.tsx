"use client";
import { Player } from "../data/mocks";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";

export default function RankingList({ players }: { players: Player[] }) {
  // Ordenar por média geral (Overall) decrescente
  const sortedPlayers = [...players].sort((a, b) => {
    const avgA = (a.currentStats.fisico + a.currentStats.habilidade + a.currentStats.defesa) / 3;
    const avgB = (b.currentStats.fisico + b.currentStats.habilidade + b.currentStats.defesa) / 3;
    return avgB - avgA;
  });

  return (
    <div className="space-y-2 pb-20">
      {sortedPlayers.map((player, index) => {
        const overall = Math.round((player.currentStats.fisico + player.currentStats.habilidade + player.currentStats.defesa) / 3);
        
        return (
          <div key={player.id} className="flex items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <div className="w-8 text-center font-bold text-gray-400 text-sm">#{index + 1}</div>
            
            <div className="flex-1 ml-2">
              <div className="font-bold text-gray-800 text-sm">{player.name}</div>
              <div className="text-xs text-gray-500 flex gap-2">
                <span>F: {player.currentStats.fisico}</span>
                <span>H: {player.currentStats.habilidade}</span>
                <span>D: {player.currentStats.defesa}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
               <div className={`text-lg font-bold ${overall >= 80 ? 'text-green-600' : overall < 60 ? 'text-red-500' : 'text-yellow-600'}`}>
                 {overall}
               </div>
               <span className="text-[10px] text-gray-400">GERAL</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
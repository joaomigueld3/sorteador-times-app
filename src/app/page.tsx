"use client";

import { useState } from "react";
import { MOCK_PLAYERS, PlayerAttributes } from "../data/mocks"; // Caminho relativo
import VotingCard from "../components/VotingCard"; // Caminho relativo
import RankingList from "../components/RankingList"; // Caminho relativo
import { ClipboardList, BarChart3 } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'vote' | 'ranking'>('vote');
  const [votes, setVotes] = useState<Record<string, PlayerAttributes>>({});

  const handleVoteChange = (playerId: string, newStats: PlayerAttributes) => {
    setVotes((prev) => ({ ...prev, [playerId]: newStats }));
  };

  const handleSubmit = () => {
    console.log("Enviando:", votes);
    alert("Votos salvos! (Olhe o console)");
  };

  return (
    <main className="min-h-screen bg-[#F5F5F0]">
      {/* HEADER FIXO */}
      <header className="bg-white p-4 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
        <h1 className="text-lg font-black text-gray-900 tracking-tight text-center uppercase">
          {activeTab === 'vote' ? 'Avaliar Jogadores' : 'Ranking Atual'}
        </h1>
      </header>

      {/* CONTEÚDO SCROLLÁVEL */}
      <div className="p-4 pb-32 max-w-md mx-auto">
        {activeTab === 'vote' ? (
          <div className="space-y-2">
            <p className="text-xs text-center text-gray-500 mb-4 px-4">
              Toque no número para digitar ou arraste a barra. Expanda para detalhar.
            </p>
            {MOCK_PLAYERS.map((player) => (
              <VotingCard 
                key={player.id} 
                player={player} 
                onVoteChange={handleVoteChange}
              />
            ))}
          </div>
        ) : (
          <RankingList players={MOCK_PLAYERS} />
        )}
      </div>

      {/* BOTÃO FLUTUANTE DE AÇÃO (SÓ NO VOTE) */}
      {activeTab === 'vote' && (
        <div className="fixed bottom-20 left-0 right-0 p-4 max-w-md mx-auto z-20 pointer-events-none">
          <button
            onClick={handleSubmit}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-md shadow-xl pointer-events-auto active:scale-95 transition-transform"
          >
            Confirmar Votação
          </button>
        </div>
      )}

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 z-30 pb-safe">
        <button 
          onClick={() => setActiveTab('vote')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg w-full transition-colors ${activeTab === 'vote' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <ClipboardList size={24} strokeWidth={activeTab === 'vote' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Votar</span>
        </button>

        <div className="w-px h-8 bg-gray-100"></div>

        <button 
          onClick={() => setActiveTab('ranking')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg w-full transition-colors ${activeTab === 'ranking' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <BarChart3 size={24} strokeWidth={activeTab === 'ranking' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Ranking</span>
        </button>
      </div>
    </main>
  );
}
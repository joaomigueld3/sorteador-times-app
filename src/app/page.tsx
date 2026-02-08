"use client";

import { useState } from "react";
import { MOCK_PLAYERS, Player, PlayerAttributes } from "../data/mocks";
import VotingCard from "../components/VotingCard";
import LoginModal from "../components/LoginModal";
import { Trophy, LogOut } from "lucide-react";

export default function Home() {
  // Estado do usuário logado
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [votes, setVotes] = useState<Record<string, PlayerAttributes>>({});

  const handleVoteChange = (playerId: string, newStats: PlayerAttributes) => {
    setVotes((prev) => ({ ...prev, [playerId]: newStats }));
  };

  const handleSubmit = () => {
    const payload = {
      voterId: currentUser?.id,
      votes: votes,
      timestamp: new Date().toISOString()
    };
    console.log("Enviando Payload Seguro:", payload);
    alert(`Obrigado, ${currentUser?.name}! Seus votos foram computados.`);
    // Aqui você redirecionaria ou limparia o estado
  };

  // Se não estiver logado, mostra o modal
  if (!currentUser) {
    return <LoginModal onLogin={setCurrentUser} />;
  }

  return (
    <main className="min-h-screen bg-dark-900 text-gray-100 font-sans selection:bg-neon-400 selection:text-black">
      {/* HEADER */}
      <header className="bg-dark-800/80 backdrop-blur-md p-4 sticky top-0 z-30 border-b border-dark-700">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white italic tracking-tighter flex items-center gap-2">
              SORTEIO<span className="text-neon-400">PRO</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium">
              Votando como: <span className="text-neon-400">{currentUser.name}</span>
            </p>
          </div>
          <button 
            onClick={() => setCurrentUser(null)}
            className="p-2 bg-dark-700 rounded-full text-gray-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* LISTA DE VOTAÇÃO */}
      <div className="p-4 pb-32 max-w-md mx-auto">
        <div className="bg-neon-400/5 border border-neon-400/20 rounded-lg p-3 mb-6 flex gap-3 items-center">
            <Trophy className="text-neon-400 shrink-0" size={20} />
            <p className="text-xs text-gray-300">
              As notas são calculadas automaticamente: 
              <span className="text-neon-400 font-bold ml-1">Físico 40%</span> • 
              <span className="text-neon-400 font-bold ml-1">Hab. 35%</span> • 
              <span className="text-neon-400 font-bold ml-1">Def. 25%</span>
            </p>
        </div>

        {MOCK_PLAYERS.map((player) => (
          <VotingCard 
            key={player.id} 
            player={player} 
            onVoteChange={handleVoteChange}
            isSelf={currentUser.id === player.id}
          />
        ))}
      </div>

      {/* BOTÃO FLUTUANTE */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark-900 to-transparent z-20">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            className="w-full bg-neon-400 text-dark-900 py-4 rounded-xl font-black text-lg shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            Confirmar Votação
          </button>
        </div>
      </div>
    </main>
  );
}
"use client";

import { useState, useEffect } from "react";
import { MOCK_PLAYERS, PlayerAttributes, calculateOverall } from "../data/mocks";
import VotingCard from "../components/VotingCard";
import RankingList from "../components/RankingList";
import LoginModal from "../components/LoginModal";
import { Sun, Moon, LogOut, CheckCircle2 } from "lucide-react";

export default function Home() {
  // Tema padrão agora é 'dark' (Cyber Green)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'vote' | 'ranking'>('vote');
  const [votes, setVotes] = useState<Record<string, PlayerAttributes>>({});

  useEffect(() => {
    // Se theme for 'dark', remove atributo (usa :root). Se for 'light', seta atributo.
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleVoteChange = (playerId: string, newStats: PlayerAttributes) => {
    setVotes((prev) => ({ ...prev, [playerId]: newStats }));
  };

  // ORDENAÇÃO DECRESCENTE POR NOTA ATUAL
  const sortedPlayersForVoting = [...MOCK_PLAYERS].sort((a, b) => 
    calculateOverall(b.currentStats) - calculateOverall(a.currentStats)
  );

  if (!currentUser) {
    return <LoginModal onLogin={setCurrentUser} toggleTheme={toggleTheme} currentTheme={theme} />;
  }

  return (
    <main className="min-h-screen pb-24 transition-colors duration-300">
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-30 px-4 py-3 shadow-sm backdrop-blur-md border-b"
        style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border)' }}>
        
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-black italic tracking-tighter text-white">
            Perronhas<span style={{ color: 'var(--accent)' }}>Rebirth</span>
          </h1>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <button 
              onClick={() => setCurrentUser(null)}
              className="p-2 rounded-full hover:bg-red-500/20 text-white/80 hover:text-red-200"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
        
        <div className="max-w-md mx-auto mt-2 flex p-1 rounded-lg bg-black/10">
          <button
            onClick={() => setActiveTab('vote')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'vote' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'}`}
            style={{ 
              backgroundColor: activeTab === 'vote' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'vote' ? 'var(--accent-text)' : 'white'
            }}
          >
            VOTAÇÃO
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'ranking' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'}`}
            style={{ 
              backgroundColor: activeTab === 'ranking' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'ranking' ? 'var(--accent-text)' : 'white'
            }}
          >
            RANKING TOP
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="p-4 max-w-5xl mx-auto animate-[fadeIn_0.5s_ease]">
        {activeTab === 'vote' ? (
          <>
            <div className="mb-4 text-xs text-center opacity-70" style={{ color: 'var(--text-secondary)' }}>
              Jogadores ordenados por ranking atual. Ajuste quem mudou de nível.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedPlayersForVoting.map((player) => (
                <VotingCard 
                  key={player.id} 
                  player={player} 
                  onVoteChange={handleVoteChange}
                  isSelf={currentUser.id === player.id}
                />
              ))}
            </div>
          </>
        ) : (
          <RankingList players={MOCK_PLAYERS} />
        )}
      </div>

      {activeTab === 'vote' && (
        <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-20 pointer-events-none">
          <button
            onClick={() => alert('Votos salvos!')}
            className="pointer-events-auto shadow-lg hover:scale-105 active:scale-95 transition-transform px-8 py-3 rounded-full font-bold flex items-center gap-2"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <CheckCircle2 size={18} /> CONFIRMAR RODADA
          </button>
        </div>
      )}
    </main>
  );
}
"use client";

import { useState, useEffect } from "react";
import { api } from "../services/api"; // Importando a API real
import VotingCard from "../components/VotingCard";
import RankingList from "../components/RankingList";
import LoginModal from "../components/LoginModal";
import { Sun, Moon, LogOut, CheckCircle2 } from "lucide-react";
// Função auxiliar simples para calcular média (substituindo o mock)
const calculateOverall = (stats: any) => {
  if (!stats) return 0;
  return Math.round((stats.fisico * 0.4) + (stats.habilidade * 0.35) + (stats.defesa * 0.25));
};

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // ESTADOS REAIS
  const [players, setPlayers] = useState<any[]>([]); // Lista do Backend
  const [currentUser, setCurrentUser] = useState<any>(null); // Usuário Logado
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null); // Rodada
  
  const [activeTab, setActiveTab] = useState<'vote' | 'ranking'>('vote');
  const [votes, setVotes] = useState<Record<string, any>>({});

  // 1. Carrega jogadores ao iniciar
  useEffect(() => {
    api.getPlayers().then(data => {
      if (Array.isArray(data)) {
        setPlayers(data);
      }
    });

    // Configura tema
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Callback chamado pelo LoginModal quando o login dá certo no Back
  const handleLoginSuccess = (user: any, matchId: string) => {
    setCurrentUser(user);
    setActiveMatchId(matchId);
  };

  const handleVoteChange = (playerId: string, newStats: any) => {
    setVotes((prev) => ({ ...prev, [playerId]: newStats }));
  };

  // Envia votos para o Backend
  const confirmRound = async () => {
    if (!currentUser || !activeMatchId) {
      alert("Erro: Nenhuma rodada ativa encontrada.");
      return;
    }

    if (Object.keys(votes).length === 0) {
      alert("Você não alterou nenhuma nota.");
      return;
    }

    try {
      await api.submitVote(currentUser._id, activeMatchId, votes);
      alert(`Sucesso! Seus votos foram computados na rodada.`);
    } catch (error) {
      alert("Erro ao enviar votos. Tente novamente.");
    }
  };

  // Ordena players para exibição
  const sortedPlayersForVoting = [...players].sort((a, b) => 
    calculateOverall(b.currentStats) - calculateOverall(a.currentStats)
  );

  // Se não estiver logado, mostra Modal passando a lista de jogadores carregada
  if (!currentUser) {
    return (
      <LoginModal 
        players={players} 
        onLogin={handleLoginSuccess} 
        toggleTheme={toggleTheme} 
        currentTheme={theme} 
      />
    );
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
              onClick={() => { setCurrentUser(null); setActiveMatchId(null); }}
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
              Rodada Ativa. Seu voto é atualizado em tempo real.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedPlayersForVoting.map((player) => (
                <VotingCard 
                  key={player._id}  // MongoDB usa _id
                  player={{...player, id: player._id}} // Adaptador rápido se o VotingCard usa .id
                  onVoteChange={handleVoteChange}
                  isSelf={currentUser._id === player._id}
                />
              ))}
            </div>
          </>
        ) : (
          <RankingList players={players.map(p => ({...p, id: p._id}))} />
        )}
      </div>

      {activeTab === 'vote' && (
        <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-20 pointer-events-none">
          <button
            onClick={confirmRound}
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
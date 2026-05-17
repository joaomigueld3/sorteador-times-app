"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../services/api";
import { MOCK_PLAYERS } from "../../data/mocks";
import VotingCard from "../../components/VotingCard";
import RankingList from "../../components/RankingList";
import LoginModal from "../../components/LoginModal";
import { Sun, Moon, LogOut, CheckCircle2 } from "lucide-react";

const calculateOverall = (stats: any) => {
  if (!stats) return 0;
  return Math.round((stats.fisico * 0.4) + (stats.habilidade * 0.35) + (stats.defesa * 0.25));
};

export default function NotasPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [players, setPlayers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"vote" | "ranking">("vote");
  const [votes, setVotes] = useState<Record<string, any>>({});
  const [backendError, setBackendError] = useState("");
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    api.getPlayers()
      .then((data) => {
        if (Array.isArray(data)) {
          setPlayers(data);
          setBackendError("");
          setOfflineMode(false);
        }
      })
      .catch((error) => {
        const fallbackPlayers = MOCK_PLAYERS.map((p) => ({ ...p, _id: p.id }));
        setPlayers(fallbackPlayers);
        setOfflineMode(true);
        setBackendError(`${getErrorMessage(error, "Nao foi possivel carregar os jogadores.")} Usando dados locais.`);
      });

    if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => prev === "light" ? "dark" : "light");
  const handleLoginSuccess = (user: any, matchId: string | null) => {
    setCurrentUser(user);
    setActiveMatchId(matchId);
  };
  const handleVoteChange = (playerId: string, newStats: any) => setVotes((prev) => ({ ...prev, [playerId]: newStats }));

  const confirmRound = async () => {
    if (offlineMode) {
      alert("Modo offline ativo: votos nao sao enviados para backend.");
      return;
    }
    if (!currentUser || !activeMatchId) return alert("Erro: Nenhuma rodada ativa encontrada.");
    if (Object.keys(votes).length === 0) return alert("Você não alterou nenhuma nota.");
    try {
      await api.submitVote(currentUser._id, activeMatchId, votes);
      alert("Sucesso! Seus votos foram computados na rodada.");
      setBackendError("");
    } catch (error) {
      const message = getErrorMessage(error, "Erro ao enviar votos. Tente novamente.");
      setBackendError(message);
      alert(message);
    }
  };

  const sortedPlayersForVoting = [...players].sort((a, b) => calculateOverall(b.currentStats) - calculateOverall(a.currentStats));

  if (!currentUser) {
    return <LoginModal players={players} onLogin={handleLoginSuccess} toggleTheme={toggleTheme} currentTheme={theme} backendError={backendError} offlineMode={offlineMode} onBack={() => { window.location.href = "/"; }} />;
  }

  return (
    <main className="min-h-screen pb-24 transition-colors duration-300">
      <header className="sticky top-0 z-30 px-3 py-3 shadow-sm backdrop-blur-md border-b" style={{ backgroundColor: "var(--bg-header)", borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <Link href="/" className="text-lg font-black italic tracking-tighter text-white">
            Perronhas<span style={{ color: "var(--accent)" }}>Rebirth</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="px-2.5 py-1.5 rounded-md text-xs font-bold bg-black/20 text-white">
              INICIO
            </Link>
            <Link href="/sorteio" className="px-2.5 py-1.5 rounded-md text-xs font-bold bg-black/20 text-white">SORTEIO</Link>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 text-white">{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>
            <button onClick={() => { setCurrentUser(null); setActiveMatchId(null); }} className="p-2 rounded-full hover:bg-red-500/20 text-white/80"><LogOut size={18} /></button>
          </div>
        </div>
        <div className="max-w-xl mx-auto mt-2 flex p-1 rounded-lg bg-black/10">
          <button onClick={() => setActiveTab("vote")} className={`flex-1 py-2 text-xs font-bold rounded-md ${activeTab === "vote" ? "shadow-sm" : "opacity-60"}`} style={{ backgroundColor: activeTab === "vote" ? "var(--bg-card)" : "transparent", color: activeTab === "vote" ? "var(--accent-text)" : "white" }}>VOTACAO</button>
          <button onClick={() => setActiveTab("ranking")} className={`flex-1 py-2 text-xs font-bold rounded-md ${activeTab === "ranking" ? "shadow-sm" : "opacity-60"}`} style={{ backgroundColor: activeTab === "ranking" ? "var(--bg-card)" : "transparent", color: activeTab === "ranking" ? "var(--accent-text)" : "white" }}>RANKING</button>
        </div>
      </header>
      <div className="p-3 md:p-4 max-w-5xl mx-auto">
        {backendError && <div className="mb-3 rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: "#fca5a5", color: "#fecaca", backgroundColor: "rgba(127, 29, 29, 0.35)" }}>{backendError}</div>}
        {activeTab === "vote" ? (
          <div className="max-w-md">
            <div className="mb-2 text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
              {players.length} jogadores
            </div>
            <div className="grid grid-cols-1 gap-2">
            {sortedPlayersForVoting.map((player) => (
              <VotingCard key={player._id} player={{ ...player, id: player._id }} onVoteChange={handleVoteChange} isSelf={currentUser._id === player._id} />
            ))}
            </div>
          </div>
        ) : (
          <RankingList players={players.map((p) => ({ ...p, id: p._id }))} />
        )}
      </div>
      {activeTab === "vote" && (
        <div className="fixed bottom-4 left-0 right-0 px-3 flex justify-center z-20 pointer-events-none">
          <button onClick={confirmRound} className="pointer-events-auto px-6 py-3 rounded-full font-bold flex items-center gap-2" style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}>
            <CheckCircle2 size={18} /> CONFIRMAR
          </button>
        </div>
      )}
    </main>
  );
}

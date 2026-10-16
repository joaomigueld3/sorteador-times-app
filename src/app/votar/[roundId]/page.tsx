"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { CheckCircle2, Loader2, ChevronDown, ChevronUp, Sun, Moon } from "lucide-react";

interface PlayerInfo {
  _id: string;
  name: string;
  positions: string[];
  type?: string;
}

interface PlayerAttributes {
  fisico: number;
  habilidade: number;
  defesa: number;
}

interface RoundInfo {
  _id: string;
  status: string;
  adminNotes: Record<string, PlayerAttributes>;
  players: PlayerInfo[];
  voteCount: number;
  totalPlayers: number;
  hasVoted: boolean;
  isDiarista?: boolean;
}

const STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

function NoteSelector({
  label,
  value,
  color,
  onChange,
}: {
  label: string;
  value?: number;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold" style={{ color }}>
          {label}
        </span>

      </div>
      <div className="flex flex-wrap gap-1">
        {STEPS.map((step) => (
          <button
            key={step}
            onClick={() => onChange(step)}
            className={`px-2 py-1.5 rounded text-[11px] font-bold border transition-all ${
              value === step
                ? "ring-2 ring-offset-1 scale-105"
                : "opacity-60 hover:opacity-100"
            }`}
            style={{
              backgroundColor:
                value === step ? color : "var(--bg-page)",
              color: value === step ? "#fff" : "var(--text-primary)",
              borderColor: "var(--border)",
            }}
          >
            {step}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlayerVoteCard({
  player,
  votes,
  onVoteChange,
}: {
  player: PlayerInfo;
  votes: Partial<PlayerAttributes>;
  onVoteChange: (attr: keyof PlayerAttributes, val: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  
  const hasAllVotes = votes.fisico !== undefined && votes.habilidade !== undefined && votes.defesa !== undefined;
  const overall = hasAllVotes
    ? Math.round((votes.fisico as number) * 0.40 + (votes.habilidade as number) * 0.35 + (votes.defesa as number) * 0.25)
    : "--";

  return (
    <div
      className="rounded-xl border overflow-hidden shadow-sm"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-2 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            {player.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              {player.name}
            </h3>
            <div className="flex gap-1">
              {player.positions.map((pos) => (
                <span
                  key={pos}
                  className="text-[9px] font-bold px-1 rounded"
                  style={{
                    backgroundColor: pos === "ATA" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
                    color: pos === "ATA" ? "#ef4444" : "#3b82f6",
                  }}
                >
                  {pos}
                </span>
              ))}
              <span
                  className="text-[9px] font-bold px-1 rounded"
                  style={{
                    backgroundColor: player.type === "diarista" ? "rgba(245,158,11,0.15)" : "rgba(107,114,128,0.15)",
                    color: player.type === "diarista" ? "#f59e0b" : "#6b7280",
                  }}
                >
                  {player.type === "diarista" ? "DIARISTA" : "MENSALISTA"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div title="A nota crua é salva no banco. Os pesos (Físico 40%, Habilidade 35%, Defesa 25%) são aplicados no sorteio." className="text-lg font-black cursor-help" style={{ color: "var(--accent)" }}>
            {overall}
          </div>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-1 border-t" style={{ borderColor: "var(--border)" }}>
          <NoteSelector
            label="FISICO"
            value={votes.fisico}
            color="var(--attr-fis)"
            onChange={(v) => onVoteChange("fisico", v)}
          />
          <NoteSelector
            label="HABILIDADE"
            value={votes.habilidade}
            color="var(--attr-hab)"
            onChange={(v) => onVoteChange("habilidade", v)}
          />
          <NoteSelector
            label="DEFESA"
            value={votes.defesa}
            color="var(--attr-def)"
            onChange={(v) => onVoteChange("defesa", v)}
          />
        </div>
      )}
    </div>
  );
}

export default function VotarPage() {
  const { roundId } = useParams<{ roundId: string }>();
  const { data: session, status: authStatus } = useSession();
  const [round, setRound] = useState<RoundInfo | null>(null);
  const [votes, setVotes] = useState<Record<string, Partial<PlayerAttributes>>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [localEmail, setLocalEmail] = useState("");
  const [localPassword, setLocalPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"name" | "overall">("name");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]);

  useEffect(() => {
    if (!roundId) return;
    fetch(`/api/rounds/${roundId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setRound(data);
          if (data.hasVoted) {
            setSubmitted(true);
          } else {
            // Inicializa vazio (o usuario precisa preencher tudo ativamente)
            setVotes({});
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao carregar rodada.");
        setLoading(false);
      });
  }, [roundId]);

  const handleVoteChange = (playerId: string, attr: keyof PlayerAttributes, val: number) => {
    setVotes((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], [attr]: val },
    }));
  };

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      setError("Faca login com Google primeiro.");
      return;
    }
    
    if (round) {
      const missingVotes = round.players.some(p => 
        !votes[p._id] || 
        votes[p._id].fisico === undefined || 
        votes[p._id].habilidade === undefined || 
        votes[p._id].defesa === undefined
      );
      if (missingVotes) {
        const confirmed = window.confirm("Você não avaliou todos os jogadores (ou deixou alguma nota em branco). Tem certeza que deseja enviar os votos parciais?");
        if (!confirmed) return;
      }
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundId, ratings: votes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao enviar voto.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Erro de conexao.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} style={{ color: "var(--accent)" }} />
      </main>
    );
  }

  if (error && !round) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 font-bold mb-4">{error}</p>
          <Link href="/" className="underline" style={{ color: "var(--accent)" }}>
            Voltar
          </Link>
        </div>
      </main>
    );
  }

  if (!round) return null;

  if (round.status !== "open") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
            Votacao encerrada
          </p>
          <Link href="/" className="underline" style={{ color: "var(--accent)" }}>
            Voltar
          </Link>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle2 size={48} className="mx-auto mb-3" style={{ color: "var(--accent)" }} />
          <h2 className="text-xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
            Voto registrado!
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            Seu voto foi computado anonimamente.
          </p>
          <Link href="/" className="underline" style={{ color: "var(--accent)" }}>
            Voltar ao inicio
          </Link>
        </div>
      </main>
    );
  }

    // Not logged in
  if (authStatus !== "authenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-2xl border p-6 shadow-xl text-center space-y-6"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div>
            <h1 className="text-xl font-black italic tracking-tighter mb-1" style={{ color: "var(--text-primary)" }}>
              Perronhas<span style={{ color: "var(--accent)" }}>Rebirth</span>
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Faca login para votar nesta rodada
            </p>
          </div>

          <button
            onClick={() => signIn("google")}
            className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Continuar com o Google
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t" style={{ borderColor: "var(--border)" }}></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold" style={{ color: "var(--text-secondary)" }}>OU</span>
            <div className="flex-grow border-t" style={{ borderColor: "var(--border)" }}></div>
          </div>

          <div className="space-y-3 text-left">
            <input
              type="text"
              placeholder="Email (ex: joao@teste.com)"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
              className="w-full p-3 rounded-lg border outline-none text-sm"
              style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            <input
              type="password"
              placeholder="Qualquer senha"
              value={localPassword}
              onChange={(e) => setLocalPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && localEmail && localPassword) {
                  setLocalLoading(true);
                  signIn("credentials", { email: localEmail, password: localPassword });
                }
              }}
              className="w-full p-3 rounded-lg border outline-none text-sm"
              style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            <button
              onClick={() => {
                setLocalLoading(true);
                signIn("credentials", { email: localEmail, password: localPassword });
              }}
              disabled={!localEmail || !localPassword || localLoading}
              className="w-full py-3 rounded-lg font-bold disabled:opacity-50 transition-all duration-200 hover:brightness-110 active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}
            >
              {localLoading ? "Entrando..." : "Entrar com Teste Local"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      <header
        className="sticky top-0 z-30 px-3 py-2 shadow-sm backdrop-blur-md border-b flex flex-col gap-2"
        style={{ backgroundColor: "var(--bg-header)", borderColor: "var(--border)" }}
      >
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="text-lg font-black italic tracking-tighter text-white">
            Perronhas<span style={{ color: "var(--accent)" }}>Rebirth</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="flex items-center gap-2">
              {session?.user?.image && (
                <img src={session.user.image} alt="User" className="w-6 h-6 rounded-full border border-white/20" />
              )}
              {session?.user?.name && (
                <span className="text-xs font-bold text-white">{session.user.name.split(" ")[0]}</span>
              )}
            </div>
          </div>
        </div>
        {round && (
          <div className="max-w-3xl mx-auto w-full flex justify-end">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "name" | "overall")}
              className="text-[10px] p-1 rounded border outline-none font-bold"
              style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              <option value="name">A-Z</option>
              <option value="overall">Nota Geral</option>
            </select>
          </div>
        )}
      </header>

      <div className="p-3 max-w-2xl mx-auto">
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Votacao — {round.players.length} jogadores
          </h2>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Notas de 0 a 100 (multiplos de 10). Ref = nota do admin como referencia.
          </p>
        </div>

        {round.isDiarista && (
          <div
            className="mb-4 rounded-xl border p-4 text-xs font-semibold"
            style={{
              borderColor: "#f59e0b",
              color: "#fde68a",
              backgroundColor: "rgba(180, 83, 9, 0.25)",
            }}
          >
            <p className="font-bold text-sm mb-1 text-amber-300">Perfil Diarista</p>
            <p>
              Você está identificado como jogador <strong>Diarista</strong>. Diaristas podem ser avaliados na rodada, mas não possuem permissão para votar.
            </p>
          </div>
        )}

        {error && (
          <div
            className="mb-3 rounded-lg border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: "#fca5a5", color: "#fecaca", backgroundColor: "rgba(127,29,29,0.35)" }}
          >
            {error}
          </div>
        )}

        <div className="mb-4 p-3 rounded-lg border text-xs text-center" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          <p>
            <strong>Atenção:</strong> As notas que você escolher serão salvas <strong>puras</strong> no banco de dados. A nota geral exibida nesta tela aplica os pesos padrão (Físico 40%, Habilidade 35%, Defesa 25%) apenas para visualização.
          </p>
        </div>
        <div className="space-y-2">
          {(() => {
            const sortedPlayers = [...round.players].sort((a, b) => {
              if (sortOrder === "overall") {
                const vA = votes[a._id];
                const vB = votes[b._id];
                const hasA = vA?.fisico !== undefined && vA?.habilidade !== undefined && vA?.defesa !== undefined;
                const hasB = vB?.fisico !== undefined && vB?.habilidade !== undefined && vB?.defesa !== undefined;
                const ovrA = hasA ? Math.round(vA!.fisico! * 0.40 + vA!.habilidade! * 0.35 + vA!.defesa! * 0.25) : -1;
                const ovrB = hasB ? Math.round(vB!.fisico! * 0.40 + vB!.habilidade! * 0.35 + vB!.defesa! * 0.25) : -1;
                const diff = ovrB - ovrA;
                if (diff !== 0) return diff;
              }
              return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
            });
            return sortedPlayers.map((player) => (
            <PlayerVoteCard
              key={player._id}
              player={player}
                            votes={votes[player._id] || {}}
              onVoteChange={(attr, val) => handleVoteChange(player._id, attr, val)}
            />
          ))})()}
        </div>
      </div>

      <div className="fixed bottom-4 left-0 right-0 px-3 flex justify-center z-20 pointer-events-none">
        {round.isDiarista ? (
          <div
            className="pointer-events-auto px-6 py-2.5 rounded-full font-bold text-xs shadow-xl border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "#f59e0b", color: "#fde68a" }}
          >
            Diaristas não votam
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="pointer-events-auto px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}
          >
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" /> Enviando...</>
            ) : (
              <><CheckCircle2 size={18} /> ENVIAR VOTOS</>
            )}
          </button>
        )}
      </div>
    </main>
  );
}

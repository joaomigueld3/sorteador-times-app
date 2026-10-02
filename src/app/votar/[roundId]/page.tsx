"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { CheckCircle2, LogIn, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface PlayerInfo {
  _id: string;
  name: string;
  positions: string[];
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
  adminRef,
  color,
  onChange,
}: {
  label: string;
  value: number;
  adminRef: number;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold" style={{ color }}>
          {label}
        </span>
        <span className="text-[10px] opacity-60" style={{ color: "var(--text-secondary)" }}>
          Ref: {adminRef}
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
              borderColor:
                step === adminRef
                  ? color
                  : "var(--border)",
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
  adminNote,
  votes,
  onVoteChange,
}: {
  player: PlayerInfo;
  adminNote: PlayerAttributes;
  votes: PlayerAttributes;
  onVoteChange: (attr: keyof PlayerAttributes, val: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const overall = Math.round(
    votes.fisico * 0.4 + votes.habilidade * 0.35 + votes.defesa * 0.25
  );

  return (
    <div
      className="rounded-xl border overflow-hidden shadow-sm"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between"
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
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black" style={{ color: "var(--accent)" }}>
            {overall}
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-1 border-t" style={{ borderColor: "var(--border)" }}>
          <NoteSelector
            label="FISICO"
            value={votes.fisico}
            adminRef={adminNote.fisico}
            color="var(--attr-fis)"
            onChange={(v) => onVoteChange("fisico", v)}
          />
          <NoteSelector
            label="HABILIDADE"
            value={votes.habilidade}
            adminRef={adminNote.habilidade}
            color="var(--attr-hab)"
            onChange={(v) => onVoteChange("habilidade", v)}
          />
          <NoteSelector
            label="DEFESA"
            value={votes.defesa}
            adminRef={adminNote.defesa}
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
  const [votes, setVotes] = useState<Record<string, PlayerAttributes>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
            // Pre-fill with admin notes
            const initial: Record<string, PlayerAttributes> = {};
            for (const p of data.players) {
              initial[p._id] = data.adminNotes[p._id] || { fisico: 50, habilidade: 50, defesa: 50 };
            }
            setVotes(initial);
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
          className="w-full max-w-sm rounded-2xl border p-6 shadow-xl text-center"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <h1 className="text-xl font-black italic tracking-tighter mb-1" style={{ color: "var(--text-primary)" }}>
            Perronhas<span style={{ color: "var(--accent)" }}>Rebirth</span>
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Faca login para votar nesta rodada
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}
          >
            <LogIn size={18} /> Entrar com Google
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      <header
        className="sticky top-0 z-30 px-3 py-2 shadow-sm backdrop-blur-md border-b"
        style={{ backgroundColor: "var(--bg-header)", borderColor: "var(--border)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-black italic tracking-tighter text-white">
            Perronhas<span style={{ color: "var(--accent)" }}>Rebirth</span>
          </Link>
          <span className="text-xs text-white/70">
            {session.user?.email}
          </span>
        </div>
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

        <div className="space-y-2">
          {round.players.map((player) => (
            <PlayerVoteCard
              key={player._id}
              player={player}
              adminNote={round.adminNotes[player._id] || { fisico: 50, habilidade: 50, defesa: 50 }}
              votes={votes[player._id] || { fisico: 50, habilidade: 50, defesa: 50 }}
              onVoteChange={(attr, val) => handleVoteChange(player._id, attr, val)}
            />
          ))}
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

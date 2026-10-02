"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, CheckCircle2, Loader2 } from "lucide-react";

interface PlayerAttributes {
  fisico: number;
  habilidade: number;
  defesa: number;
}

interface PlayerInfo {
  _id: string;
  name: string;
  positions: string[];
}

interface RoundDetail {
  round: {
    _id: string;
    status: string;
    createdAt: string;
    adminNotes: Record<string, PlayerAttributes>;
    votedEmails: string[];
    voteCount: number;
    playerIds: string[];
  };
  votes: { ratings: Record<string, PlayerAttributes> }[];
  computedAverages: Record<string, PlayerAttributes>;
  players: PlayerInfo[];
  voterNames: string[];
}

function overall(s: PlayerAttributes) {
  return Math.round(s.fisico * 0.4 + s.habilidade * 0.35 + s.defesa * 0.25);
}

export default function RodadaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RoundDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadRound = useCallback(async () => {
    try {
      const secret = sessionStorage.getItem("adminSecret") || "";
      const res = await fetch(`/api/admin/rounds/${id}`, { headers: { "x-admin-secret": secret } });
      if (!res.ok) {
        setError("Erro ao carregar rodada. Volte ao painel e faca login.");
        return;
      }
      const d = await res.json();
      setData(d);
    } catch {
      setError("Erro de conexao.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRound();
  }, [loadRound]);

  const handleAction = async (action: string) => {
    setActionLoading(true);
    setError("");
    try {
      const secret = sessionStorage.getItem("adminSecret") || "";
      const body: Record<string, unknown> = { action };
      if (action === "apply" && data) {
        body.finalNotes = data.computedAverages;
      }
      const res = await fetch(`/api/admin/rounds/${id}`, {
        method: "PATCH",
        headers: { "x-admin-secret": secret, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Erro.");
      } else {
        loadRound();
      }
    } catch {
      setError("Erro de conexao.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} style={{ color: "var(--accent)" }} />
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 font-bold mb-4">{error}</p>
          <Link href="/admin" className="underline" style={{ color: "var(--accent)" }}>Voltar</Link>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const { round, votes, computedAverages, players, voterNames } = data;
  const playerMap = Object.fromEntries(players.map((p) => [p._id, p]));

  return (
    <main className="min-h-screen pb-8">
      <header className="sticky top-0 z-30 px-3 py-2 shadow-sm backdrop-blur-md border-b"
        style={{ backgroundColor: "var(--bg-header)", borderColor: "var(--border)" }}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-white"><ArrowLeft size={20} /></Link>
          <span className="text-sm font-bold text-white">
            Rodada {new Date(round.createdAt).toLocaleDateString("pt-BR")}
          </span>
          <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded ${
            round.status === "open" ? "bg-green-500/20 text-green-300" :
            round.status === "applied" ? "bg-blue-500/20 text-blue-300" :
            "bg-yellow-500/20 text-yellow-300"
          }`}>
            {round.status === "open" ? "Aberta" : round.status === "closed" ? "Fechada" : "Aplicada"}
          </span>
        </div>
      </header>

      <div className="p-3 max-w-4xl mx-auto space-y-4">
        {error && (
          <div className="rounded-lg border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: "#fca5a5", color: "#fecaca", backgroundColor: "rgba(127,29,29,0.35)" }}>
            {error}
          </div>
        )}

        {/* Quem votou */}
        <section className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <h3 className="text-xs font-bold mb-2" style={{ color: "var(--text-secondary)" }}>
            Votos: {round.voteCount} recebidos
          </h3>
          <div className="flex flex-wrap gap-1">
            {voterNames.map((name) => (
              <span key={name} className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 font-bold">
                {name}
              </span>
            ))}
          </div>
        </section>

        {/* Medias computadas */}
        {Object.keys(computedAverages).length > 0 && (
          <section className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <h3 className="text-xs font-bold mb-3" style={{ color: "var(--text-secondary)" }}>
              Medias Computadas (resultado da votacao)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: "var(--text-secondary)" }}>
                    <th className="text-left py-1">Jogador</th>
                    <th className="text-center py-1" style={{ color: "var(--attr-fis)" }}>F</th>
                    <th className="text-center py-1" style={{ color: "var(--attr-hab)" }}>H</th>
                    <th className="text-center py-1" style={{ color: "var(--attr-def)" }}>D</th>
                    <th className="text-center py-1">OVR</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(computedAverages)
                    .sort(([, a], [, b]) => overall(b) - overall(a))
                    .map(([pid, avg]) => (
                      <tr key={pid} className="border-t" style={{ borderColor: "var(--border)" }}>
                        <td className="py-2 font-bold" style={{ color: "var(--text-primary)" }}>
                          {playerMap[pid]?.name || pid}
                        </td>
                        <td className="text-center" style={{ color: "var(--attr-fis)" }}>{avg.fisico}</td>
                        <td className="text-center" style={{ color: "var(--attr-hab)" }}>{avg.habilidade}</td>
                        <td className="text-center" style={{ color: "var(--attr-def)" }}>{avg.defesa}</td>
                        <td className="text-center font-black" style={{ color: "var(--accent)" }}>{overall(avg)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Votos individuais (anonimos) */}
        <section className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <h3 className="text-xs font-bold mb-3" style={{ color: "var(--text-secondary)" }}>
            Votos Individuais (anonimos)
          </h3>
          {votes.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Nenhum voto ainda.</p>
          ) : (
            <div className="space-y-3">
              {votes.map((vote, idx) => (
                <div key={idx} className="rounded-lg border p-2" style={{ borderColor: "var(--border)" }}>
                  <span className="text-[10px] font-bold" style={{ color: "var(--text-secondary)" }}>
                    Voto #{idx + 1}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {Object.entries(vote.ratings).map(([pid, r]) => (
                      <div key={pid} className="flex items-center gap-2 text-[10px]">
                        <span className="w-28 truncate font-bold" style={{ color: "var(--text-primary)" }}>
                          {playerMap[pid]?.name || pid}
                        </span>
                        <span style={{ color: "var(--attr-fis)" }}>F:{(r as PlayerAttributes).fisico}</span>
                        <span style={{ color: "var(--attr-hab)" }}>H:{(r as PlayerAttributes).habilidade}</span>
                        <span style={{ color: "var(--attr-def)" }}>D:{(r as PlayerAttributes).defesa}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Acoes */}
        {round.status !== "applied" && (
          <div className="flex gap-2">
            {round.status === "open" && (
              <button
                onClick={() => handleAction("close")}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <Lock size={16} /> FECHAR VOTACAO
              </button>
            )}
            <button
              onClick={() => handleAction("apply")}
              disabled={actionLoading || Object.keys(computedAverages).length === 0}
              className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              APLICAR NOTAS
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

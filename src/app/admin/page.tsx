"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, EyeOff, Unlock, Loader2, UserPlus } from "lucide-react";
import { PlayerType, Position } from "@/lib/types";
import { parsePlayerLines } from "@/lib/playerParser";

interface PlayerInfo {
  _id: string;
  name: string;
  positions: string[];
  currentStats: { fisico: number; habilidade: number; defesa: number };
  type?: PlayerType;
}

interface RoundInfo {
  _id: string;
  createdAt: string;
  status: string;
  voteCount: number;
  playerIds: string[];
  votedEmails: string[];
}

const STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

function AdminNoteInput({
  label,
  value,
  color,
  onChange,
}: {
  label: string;
  value: number;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold w-6" style={{ color }}>{label}</span>
      <div className="flex gap-0.5 flex-wrap">
        {STEPS.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`w-7 h-6 rounded text-[9px] font-bold border transition-all ${
              value === s ? "scale-105" : "opacity-50 hover:opacity-80"
            }`}
            style={{
              backgroundColor: value === s ? color : "var(--bg-page)",
              color: value === s ? "#fff" : "var(--text-primary)",
              borderColor: "var(--border)",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [secretInput, setSecretInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [rounds, setRounds] = useState<RoundInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create round state
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [adminNotes, setAdminNotes] = useState<Record<string, { fisico: number; habilidade: number; defesa: number }>>({});
  const [creating, setCreating] = useState(false);

  const headers = { "x-admin-secret": adminSecret, "Content-Type": "application/json" };

  const loadData = async (secret: string) => {
    setLoading(true);
    try {
      const [playersRes, roundsRes] = await Promise.all([
        fetch("/api/players"),
        fetch("/api/admin/rounds", { headers: { "x-admin-secret": secret } }),
      ]);
      const playersData = await playersRes.json();
      const roundsData = await roundsRes.json();

      if (roundsRes.status === 401) {
        setError("Senha incorreta.");
        setAuthenticated(false);
        return;
      }

      setPlayers(Array.isArray(playersData) ? playersData : []);
      setRounds(Array.isArray(roundsData) ? roundsData : []);
      setError("");
      setAuthenticated(true);
      sessionStorage.setItem("adminSecret", secret);
    } catch {
      setError("Erro de conexao.");
    } finally {
      setLoading(false);
    }
  };

  // Cadastro de jogadores pelo ADM
  const [playerMode, setPlayerMode] = useState<"individual" | "lote">("individual");
  const [indName, setIndName] = useState("");
  const [indFis, setIndFis] = useState("70");
  const [indHab, setIndHab] = useState("70");
  const [indDef, setIndDef] = useState("70");
  const [indAtk, setIndAtk] = useState(true);
  const [indZag, setIndZag] = useState(false);
  const [indType, setIndType] = useState<PlayerType>("mensalista");
  const [loteText, setLoteText] = useState("");
  const [loteType, setLoteType] = useState<PlayerType>("mensalista");
  const [playerMsg, setPlayerMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [submittingPlayer, setSubmittingPlayer] = useState(false);

  const handleAddIndividual = async () => {
    if (!indName.trim()) {
      setPlayerMsg({ text: "Informe o nome do jogador.", isError: true });
      return;
    }
    const positions: Position[] = [];
    if (indAtk) positions.push("ATA");
    if (indZag) positions.push("ZAG");
    if (positions.length === 0) {
      setPlayerMsg({ text: "Selecione ao menos uma posicao (ATA ou ZAG).", isError: true });
      return;
    }

    const nf = Number(indFis);
    const nh = Number(indHab);
    const nd = Number(indDef);
    if ([nf, nh, nd].some((v) => Number.isNaN(v) || v < 0 || v > 100)) {
      setPlayerMsg({ text: "As notas devem ser entre 0 e 100.", isError: true });
      return;
    }

    setSubmittingPlayer(true);
    setPlayerMsg(null);
    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: indName.trim(),
          positions,
          currentStats: { fisico: nf, habilidade: nh, defesa: nd },
          type: indType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPlayerMsg({ text: data.error || "Erro ao adicionar jogador.", isError: true });
      } else {
        setPlayerMsg({ text: `Jogador "${indName.trim()}" cadastrado no banco com sucesso!`, isError: false });
        setIndName("");
        loadData(adminSecret);
      }
    } catch {
      setPlayerMsg({ text: "Erro de conexao ao salvar jogador.", isError: true });
    } finally {
      setSubmittingPlayer(false);
    }
  };

  const handleAddLote = async () => {
    if (!loteText.trim()) {
      setPlayerMsg({ text: "Cole os dados dos jogadores para importacao.", isError: true });
      return;
    }

    const parsed = parsePlayerLines(loteText, loteType);
    if (parsed.length === 0) {
      setPlayerMsg({ text: "Nenhum jogador valido encontrado no texto informado.", isError: true });
      return;
    }

    setSubmittingPlayer(true);
    setPlayerMsg(null);
    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers,
        body: JSON.stringify({ players: parsed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPlayerMsg({ text: data.error || "Erro ao cadastrar jogadores em lote.", isError: true });
      } else {
        const msg = `${data.insertedCount} jogador(es) adicionado(s) com sucesso!` +
          (data.skippedCount > 0 ? ` (${data.skippedCount} ja existiam e foram ignorados).` : "");
        setPlayerMsg({ text: msg, isError: false });
        setLoteText("");
        loadData(adminSecret);
      }
    } catch {
      setPlayerMsg({ text: "Erro de conexao ao salvar jogadores em lote.", isError: true });
    } finally {
      setSubmittingPlayer(false);
    }
  };

  const handleLogin = () => {
    setAdminSecret(secretInput);
    loadData(secretInput);
  };

  const togglePlayer = (pid: string) => {
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) {
        next.delete(pid);
        setAdminNotes((n) => {
          const copy = { ...n };
          delete copy[pid];
          return copy;
        });
      } else {
        next.add(pid);
        const player = players.find((p) => p._id === pid);
        if (player) {
          setAdminNotes((n) => ({
            ...n,
            [pid]: { ...player.currentStats },
          }));
        }
      }
      return next;
    });
  };

  const selectAll = () => {
    const allIds = new Set(players.map((p) => p._id));
    setSelectedPlayerIds(allIds);
    const notes: Record<string, { fisico: number; habilidade: number; defesa: number }> = {};
    for (const p of players) {
      notes[p._id] = { ...p.currentStats };
    }
    setAdminNotes(notes);
  };

  const [globalWeights, setGlobalWeights] = useState({ fisico: 40, habilidade: 30, defesa: 30 });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (authenticated) {
      fetch("/api/settings")
        .then(r => r.json())
        .then(data => {
          if (data && data.weights) setGlobalWeights(data.weights);
        })
        .catch(console.error);
    }
  }, [authenticated]);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers,
        body: JSON.stringify({ weights: globalWeights })
      });
      if (res.ok) alert("Configuracoes salvas com sucesso!");
      else alert("Erro ao salvar configuracoes.");
    } catch {
      alert("Erro de conexao.");
    } finally {
      setSavingSettings(false);
    }
  };

  const updateAdminNote = (pid: string, attr: string, val: number) => {
    setAdminNotes((prev) => ({
      ...prev,
      [pid]: { ...prev[pid], [attr]: val },
    }));
  };

  const createRound = async () => {
    if (selectedPlayerIds.size === 0) {
      setError("Selecione pelo menos 1 jogador.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/rounds", {
        method: "POST",
        headers,
        body: JSON.stringify({
          playerIds: Array.from(selectedPlayerIds),
          adminNotes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao criar rodada.");
      } else {
        setSelectedPlayerIds(new Set());
        setAdminNotes({});
        loadData(adminSecret);
      }
    } catch {
      setError("Erro de conexao.");
    } finally {
      setCreating(false);
    }
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-2xl border p-6 shadow-xl"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <h1 className="text-xl font-black italic tracking-tighter text-center mb-1" style={{ color: "var(--text-primary)" }}>
            Perronhas<span style={{ color: "var(--accent)" }}>Rebirth</span>
          </h1>
          <p className="text-sm text-center mb-4" style={{ color: "var(--text-secondary)" }}>
            Painel do Administrador
          </p>
          {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}
          <div className="relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha do admin"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full p-3 rounded-xl border outline-none"
              style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
              style={{ color: "var(--text-primary)" }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            onClick={handleLogin}
            disabled={!secretInput || loading}
            className="w-full py-3 rounded-xl font-bold disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
          <Link href="/" className="block text-center mt-3 text-xs underline" style={{ color: "var(--text-secondary)" }}>
            Voltar
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-8">
      <header
        className="sticky top-0 z-30 px-3 py-2 shadow-sm backdrop-blur-md border-b"
        style={{ backgroundColor: "var(--bg-header)", borderColor: "var(--border)" }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-black italic tracking-tighter text-white">
            Perronhas<span style={{ color: "var(--accent)" }}>Rebirth</span>
          </Link>
          <span className="text-xs font-bold text-white/60 uppercase">Admin</span>
        </div>
      </header>

      <div className="p-3 max-w-4xl mx-auto space-y-6">
        {error && (
          <div className="rounded-lg border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: "#fca5a5", color: "#fecaca", backgroundColor: "rgba(127,29,29,0.35)" }}>
            {error}
          </div>
        )}

        {/* ===== GERENCIAR JOGADORES NO BANCO ===== */}
        <section className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <UserPlus size={16} /> Cadastrar Jogadores no Banco ({players.length})
            </h2>
            <div className="flex gap-1 p-0.5 rounded-lg border text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-page)" }}>
              <button
                type="button"
                onClick={() => setPlayerMode("individual")}
                className={`px-2.5 py-1 rounded font-bold transition-all ${playerMode === "individual" ? "shadow-sm" : "opacity-60"}`}
                style={{
                  backgroundColor: playerMode === "individual" ? "var(--accent)" : "transparent",
                  color: playerMode === "individual" ? "var(--accent-text)" : "var(--text-primary)",
                }}
              >
                Adicionar individual
              </button>
              <button
                type="button"
                onClick={() => setPlayerMode("lote")}
                className={`px-2.5 py-1 rounded font-bold transition-all ${playerMode === "lote" ? "shadow-sm" : "opacity-60"}`}
                style={{
                  backgroundColor: playerMode === "lote" ? "var(--accent)" : "transparent",
                  color: playerMode === "lote" ? "var(--accent-text)" : "var(--text-primary)",
                }}
              >
                Adicionar em lote
              </button>
            </div>
          </div>

          {playerMsg && (
            <div
              className="mb-3 rounded-lg border px-3 py-2 text-xs font-semibold"
              style={{
                borderColor: playerMsg.isError ? "#fca5a5" : "#86efac",
                color: playerMsg.isError ? "#fecaca" : "#bbf7d0",
                backgroundColor: playerMsg.isError ? "rgba(127,29,29,0.35)" : "rgba(20,83,45,0.35)",
              }}
            >
              {playerMsg.text}
            </div>
          )}

          {playerMode === "individual" ? (
            <div className="space-y-3">
              <input
                value={indName}
                onChange={(e) => setIndName(e.target.value)}
                placeholder="Nome do jogador"
                className="w-full rounded-lg p-2.5 text-xs border"
                style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />

              <div className="grid grid-cols-3 gap-2">
                <label className="text-xs space-y-1">
                  <span style={{ color: "var(--attr-fis)" }}>Físico (0-100)</span>
                  <input
                    type="number"
                    value={indFis}
                    onChange={(e) => setIndFis(e.target.value)}
                    className="w-full rounded-md p-2 text-xs border"
                    style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </label>
                <label className="text-xs space-y-1">
                  <span style={{ color: "var(--attr-hab)" }}>Habilidade (0-100)</span>
                  <input
                    type="number"
                    value={indHab}
                    onChange={(e) => setIndHab(e.target.value)}
                    className="w-full rounded-md p-2 text-xs border"
                    style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </label>
                <label className="text-xs space-y-1">
                  <span style={{ color: "var(--attr-def)" }}>Defesa (0-100)</span>
                  <input
                    type="number"
                    value={indDef}
                    onChange={(e) => setIndDef(e.target.value)}
                    className="w-full rounded-md p-2 text-xs border"
                    style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>Posição:</span>
                  <button
                    type="button"
                    onClick={() => setIndAtk((v) => !v)}
                    className="px-2.5 py-1.5 rounded-full border font-bold text-xs"
                    style={{
                      borderColor: indAtk ? "var(--accent)" : "var(--border)",
                      backgroundColor: indAtk ? "var(--accent)" : "transparent",
                      color: indAtk ? "var(--accent-text)" : "var(--text-primary)",
                    }}
                  >
                    ⚔️ ATA
                  </button>
                  <button
                    type="button"
                    onClick={() => setIndZag((v) => !v)}
                    className="px-2.5 py-1.5 rounded-full border font-bold text-xs"
                    style={{
                      borderColor: indZag ? "var(--accent)" : "var(--border)",
                      backgroundColor: indZag ? "var(--accent)" : "transparent",
                      color: indZag ? "var(--accent-text)" : "var(--text-primary)",
                    }}
                  >
                    🛡️ ZAG
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>Tipo:</span>
                  <button
                    type="button"
                    onClick={() => setIndType("mensalista")}
                    className="px-2.5 py-1.5 rounded-full border font-bold text-xs"
                    style={{
                      borderColor: indType === "mensalista" ? "var(--accent)" : "var(--border)",
                      backgroundColor: indType === "mensalista" ? "var(--accent)" : "transparent",
                      color: indType === "mensalista" ? "var(--accent-text)" : "var(--text-primary)",
                    }}
                  >
                    Mensalista
                  </button>
                  <button
                    type="button"
                    onClick={() => setIndType("diarista")}
                    className="px-2.5 py-1.5 rounded-full border font-bold text-xs"
                    style={{
                      borderColor: indType === "diarista" ? "#f59e0b" : "var(--border)",
                      backgroundColor: indType === "diarista" ? "#f59e0b" : "transparent",
                      color: indType === "diarista" ? "#000" : "var(--text-primary)",
                    }}
                  >
                    Diarista
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddIndividual}
                disabled={submittingPlayer}
                className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}
              >
                {submittingPlayer ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {submittingPlayer ? "Salvando..." : "Salvar no Banco"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  Formato: <code>NOME, NOTA, ATA</code> ou <code>NOME, F, H, D, ZAG, diarista</code>
                </p>
                <div className="flex items-center gap-1.5 text-xs">
                  <span style={{ color: "var(--text-secondary)" }}>Tipo padrão:</span>
                  <select
                    value={loteType}
                    onChange={(e) => setLoteType(e.target.value as PlayerType)}
                    className="rounded p-1 text-xs border"
                    style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  >
                    <option value="mensalista">Mensalista</option>
                    <option value="diarista">Diarista</option>
                  </select>
                </div>
              </div>
              <textarea
                value={loteText}
                onChange={(e) => setLoteText(e.target.value)}
                rows={5}
                className="w-full rounded-lg p-2.5 border text-xs font-mono"
                style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                placeholder={`Neymar, 90, ATA\nCasemiro, 80, 75, 90, ZAG\nConvidado, 70, 70, 70, ATA, diarista`}
              />
              <button
                type="button"
                onClick={handleAddLote}
                disabled={submittingPlayer}
                className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}
              >
                {submittingPlayer ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {submittingPlayer ? "Importando..." : "Importar para o Banco"}
              </button>
            </div>
          )}
        </section>

        {/* ===== CONFIGURACOES GLOBAIS ===== */}
        <section className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            Configuracoes Globais
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <label className="text-xs space-y-1">
              <span style={{ color: "var(--text-secondary)" }}>Peso Fisico</span>
              <input type="number" value={globalWeights.fisico} onChange={(e) => setGlobalWeights(w => ({ ...w, fisico: Number(e.target.value) }))} className="w-full p-2 rounded border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
            </label>
            <label className="text-xs space-y-1">
              <span style={{ color: "var(--text-secondary)" }}>Peso Habilidade</span>
              <input type="number" value={globalWeights.habilidade} onChange={(e) => setGlobalWeights(w => ({ ...w, habilidade: Number(e.target.value) }))} className="w-full p-2 rounded border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
            </label>
            <label className="text-xs space-y-1">
              <span style={{ color: "var(--text-secondary)" }}>Peso Defesa</span>
              <input type="number" value={globalWeights.defesa} onChange={(e) => setGlobalWeights(w => ({ ...w, defesa: Number(e.target.value) }))} className="w-full p-2 rounded border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
            </label>
          </div>
          <button onClick={saveSettings} disabled={savingSettings} className="w-full py-2 rounded font-bold text-xs" style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}>
            {savingSettings ? "Salvando..." : "Salvar Pesos Padrão"}
          </button>
        </section>

        {/* ===== CRIAR RODADA ===== */}
        <section className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Plus size={16} /> Criar Nova Rodada
          </h2>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {selectedPlayerIds.size}/{players.length} selecionados
            </span>
            <button onClick={selectAll} className="text-xs underline" style={{ color: "var(--accent)" }}>
              Selecionar todos
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto styled-scrollbar">
            {players.map((p) => {
              const selected = selectedPlayerIds.has(p._id);
              return (
                <div key={p._id} className="rounded-lg border p-2" style={{ borderColor: selected ? "var(--accent)" : "var(--border)" }}>
                  <label className="flex items-center gap-2 cursor-pointer flex-wrap">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => togglePlayer(p._id)}
                      className="rounded"
                    />
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {p.name}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                      {p.positions.join("+")}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        p.type === "diarista"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {p.type === "diarista" ? "Diarista" : "Mensalista"}
                    </span>
                  </label>
                  {selected && adminNotes[p._id] && (
                    <div className="mt-2 ml-6 space-y-1">
                      <AdminNoteInput label="F" value={adminNotes[p._id].fisico} color="var(--attr-fis)"
                        onChange={(v) => updateAdminNote(p._id, "fisico", v)} />
                      <AdminNoteInput label="H" value={adminNotes[p._id].habilidade} color="var(--attr-hab)"
                        onChange={(v) => updateAdminNote(p._id, "habilidade", v)} />
                      <AdminNoteInput label="D" value={adminNotes[p._id].defesa} color="var(--attr-def)"
                        onChange={(v) => updateAdminNote(p._id, "defesa", v)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={createRound}
            disabled={creating || selectedPlayerIds.size === 0}
            className="mt-3 w-full py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Unlock size={16} />}
            {creating ? "Criando..." : "ABRIR VOTACAO"}
          </button>
        </section>

        {/* ===== RODADAS ANTERIORES ===== */}
        <section className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <h2 className="font-bold text-sm mb-3" style={{ color: "var(--text-primary)" }}>
            Rodadas
          </h2>
          {rounds.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Nenhuma rodada criada.</p>
          ) : (
            <div className="space-y-2">
              {rounds.map((r) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div>
                    <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="text-[10px] flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                      <span className={`font-bold ${r.status === "open" ? "text-green-400" : r.status === "applied" ? "text-blue-400" : "text-yellow-400"}`}>
                        {r.status === "open" ? "Aberta" : r.status === "closed" ? "Fechada" : "Aplicada"}
                      </span>
                      <span>{r.voteCount}/{r.playerIds.length} votos</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.status === "open" && (
                      <button
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/votar/${r._id}`)}
                        className="text-[10px] px-2 py-1 rounded border font-bold"
                        style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                      >
                        COPIAR LINK
                      </button>
                    )}
                    <Link
                      href={`/admin/rodada/${r._id}`}
                      className="p-2 rounded-lg border"
                      style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                    >
                      <Eye size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

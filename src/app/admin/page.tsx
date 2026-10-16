"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, EyeOff, Unlock, Loader2, UserPlus, Edit2, Trash2, Link as LinkIcon, CheckCircle2, XCircle, X, Save, Sun, Moon, LogOut } from "lucide-react";
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

function formatRoundDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
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
  const [sortOrder, setSortOrder] = useState<"name" | "overall">("name");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("adminSecret");
    if (saved) {
      setAdminSecret(saved);
      setAuthenticated(true);
      loadData(saved);
    }
  }, []);

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

      const pArray = Array.isArray(playersData) ? playersData : [];
      setPlayers(pArray);
      setRounds(Array.isArray(roundsData) ? roundsData : []);
      setError("");
      setAuthenticated(true);
      localStorage.setItem("adminSecret", secret);

      const mensalistasIds = new Set<string>();
      pArray.forEach((p) => {
        if (!p.type || p.type === "mensalista") {
          mensalistasIds.add(p._id);
        }
      });
      setSelectedPlayerIds(mensalistasIds);
      
    } catch {
      setError("Erro de conexao.");
    } finally {
      setLoading(false);
    }
  };

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

  // Inline Editing State
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineForm, setInlineForm] = useState({ name: "", fis: "70", hab: "70", def: "70", atk: true, zag: false, type: "mensalista" as PlayerType });
  const [savingInline, setSavingInline] = useState(false);

  const resetForm = () => {
    setIndName("");
    setIndFis("70");
    setIndHab("70");
    setIndDef("70");
    setIndAtk(true);
    setIndZag(false);
    setIndType("mensalista");
  };

  const startInlineEdit = (p: PlayerInfo) => {
    setInlineEditId(p._id);
    setInlineForm({
      name: p.name,
      fis: String(p.currentStats.fisico),
      hab: String(p.currentStats.habilidade),
      def: String(p.currentStats.defesa),
      atk: p.positions.includes("ATA"),
      zag: p.positions.includes("ZAG"),
      type: p.type || "mensalista"
    });
  };

  const cancelInlineEdit = () => {
    setInlineEditId(null);
  };

  const saveInlineEdit = async (id: string) => {
    const positions: Position[] = [];
    if (inlineForm.atk) positions.push("ATA");
    if (inlineForm.zag) positions.push("ZAG");
    if (positions.length === 0) {
      alert("Selecione ao menos uma posicao (ATA ou ZAG).");
      return;
    }

    const nf = Number(inlineForm.fis);
    const nh = Number(inlineForm.hab);
    const nd = Number(inlineForm.def);
    if ([nf, nh, nd].some((v) => Number.isNaN(v) || v < 0 || v > 100)) {
      alert("As notas devem ser entre 0 e 100.");
      return;
    }

    setSavingInline(true);
    try {
      const res = await fetch(`/api/admin/players/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          name: inlineForm.name.trim(),
          positions,
          currentStats: { fisico: nf, habilidade: nh, defesa: nd },
          type: inlineForm.type,
        }),
      });
      if (!res.ok) {
        alert("Erro ao editar jogador.");
      } else {
        setInlineEditId(null);
        loadData(adminSecret);
      }
    } catch {
      alert("Erro de conexao ao salvar jogador.");
    } finally {
      setSavingInline(false);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar este jogador do banco?")) return;
    try {
      const res = await fetch(`/api/admin/players/${id}`, { method: "DELETE", headers });
      if (!res.ok) {
        alert("Erro ao apagar jogador.");
      } else {
        loadData(adminSecret);
      }
    } catch {
      alert("Erro de conexao.");
    }
  };

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
          players: [{
            name: indName.trim(),
            positions,
            currentStats: { fisico: nf, habilidade: nh, defesa: nd },
            type: indType,
          }]
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPlayerMsg({ text: data.error || "Erro ao adicionar jogador.", isError: true });
      } else {
        setPlayerMsg({ text: `Jogador "${indName.trim()}" salvo com sucesso!`, isError: false });
        resetForm();
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
      setPlayerMsg({ text: "Nenhum jogador valido encontrado.", isError: true });
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
        setPlayerMsg({ text: `${data.insertedCount} jogador(es) adicionado(s) com sucesso!`, isError: false });
        setLoteText("");
        loadData(adminSecret);
      }
    } catch {
      setPlayerMsg({ text: "Erro de conexao ao salvar jogadores em lote.", isError: true });
    } finally {
      setSubmittingPlayer(false);
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/votar/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const handleLogin = () => {
    setAdminSecret(secretInput);
    loadData(secretInput);
  };

  const togglePlayer = (pid: string) => {
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  };

  const isAllSelected = players.length > 0 && selectedPlayerIds.size === players.length;
  const selectAll = () => {
    if (isAllSelected) {
      setSelectedPlayerIds(new Set());
    } else {
      const allIds = new Set(players.map((p) => p._id));
      setSelectedPlayerIds(allIds);
    }
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
    } finally {
      setSavingSettings(false);
    }
  };

  const createRound = async () => {
    if (selectedPlayerIds.size === 0) {
      setError("Selecione pelo menos 1 jogador.");
      return;
    }
    setCreating(true);
    setError("");
    
    const adminNotes: Record<string, { name?: string; fisico: number; habilidade: number; defesa: number }> = {};
    for (const pid of Array.from(selectedPlayerIds)) {
      const p = players.find(x => x._id === pid);
      if (p) adminNotes[p._id] = { ...p.currentStats, name: p.name };
    }

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
        loadData(adminSecret);
      }
    } catch {
      setError("Erro de conexao.");
    } finally {
      setCreating(false);
    }
  };

  const updateRoundStatus = async (id: string, action: "open" | "close" | "apply") => {
    if (action === "apply" && !confirm("Registrar e Aplicar Votos?\n\nAs medias dos votos serao calculadas e salvas definitivamente no banco como os novos atributos dos jogadores. Deseja continuar?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/rounds/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        loadData(adminSecret);
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao atualizar rodada.");
      }
    } catch {
      alert("Erro de conexao.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRound = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar permanentemente esta rodada E todos os votos associados a ela?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/rounds/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        loadData(adminSecret);
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao deletar rodada.");
      }
    } catch {
      alert("Erro de conexao.");
    } finally {
      setLoading(false);
    }
  };

  const calcOverall = (stats: { fisico: number; habilidade: number; defesa: number }) => {
    return (stats.fisico * globalWeights.fisico + stats.habilidade * globalWeights.habilidade + stats.defesa * globalWeights.defesa) / 100;
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (sortOrder === "overall") {
      const diff = calcOverall(b.currentStats) - calcOverall(a.currentStats);
      if (Math.abs(diff) > 0.0001) return diff;
    }
    return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
  });

  const ratingColor = (value: number) => {
    if (value < 50) return "#ef4444";
    if (value < 60) return "#f97316";
    if (value < 70) return "#eab308";
    if (value < 80) return "#22c55e";
    if (value < 90) return "#38bdf8";
    return "#a78bfa";
  };

  const badgeClass = (role: "ATA" | "ZAG") => {
    if (role === "ATA") return "bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/30";
    if (role === "ZAG") return "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30";
    return "";
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border p-6 shadow-xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
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
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            onClick={handleLogin}
            disabled={!secretInput || loading}
            className="w-full py-3 rounded-xl font-bold disabled:opacity-50 transition-all duration-200 hover:brightness-110 active:scale-[0.98] cursor-pointer"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}
          >
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </div>
  
      {copiedId && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl bg-green-600 text-white font-bold text-sm flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in z-50">
          <CheckCircle2 size={18} /> Link copiado para a área de transferência!
        </div>
      )}
    </main>
    );
  }

  return (
    <main className="min-h-screen pb-8">
      <header
        className="sticky top-0 z-30 px-3 py-2 shadow-sm backdrop-blur-md border-b"
        style={{ backgroundColor: "var(--bg-header)", borderColor: "var(--border)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
            <button
              onClick={() => {
                localStorage.removeItem("adminSecret");
                setAuthenticated(false);
                setAdminSecret("");
              }}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 hover:bg-red-500/20 hover:text-red-300 transition-colors text-white cursor-pointer"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
            <span className="text-xs font-bold text-white/60 uppercase">Admin</span>
          </div>
        </div>
      </header>

      <div className="p-3 max-w-6xl mx-auto mt-4 flex flex-col lg:flex-row gap-6 items-start">
        {error && (
          <div className="rounded-lg border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: "#fca5a5", color: "#fecaca", backgroundColor: "rgba(127,29,29,0.35)" }}>
            {error}
          </div>
        )}

        <div className="flex-1 w-full space-y-6">

        {/* ===== GERENCIAR JOGADORES NO BANCO ===== */}
        <section className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <UserPlus size={16} /> Adicionar Jogador Banco ({players.length})
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
                Individual
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
                Lote
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
            <div className="space-y-4">
              <input
                value={indName}
                onChange={(e) => setIndName(e.target.value)}
                placeholder="Nome do jogador"
                className="w-full rounded-lg p-2.5 text-sm border font-bold"
                style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />

              <div className="grid grid-cols-3 gap-3">
                <label className="text-xs space-y-1">
                  <span style={{ color: "var(--attr-fis)" }} className="font-bold">Físico</span>
                  <input type="number" value={indFis} onChange={(e) => setIndFis(e.target.value)} className="w-full rounded-md p-2 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                </label>
                <label className="text-xs space-y-1">
                  <span style={{ color: "var(--attr-hab)" }} className="font-bold">Habilidade</span>
                  <input type="number" value={indHab} onChange={(e) => setIndHab(e.target.value)} className="w-full rounded-md p-2 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                </label>
                <label className="text-xs space-y-1">
                  <span style={{ color: "var(--attr-def)" }} className="font-bold">Defesa</span>
                  <input type="number" value={indDef} onChange={(e) => setIndDef(e.target.value)} className="w-full rounded-md p-2 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>Posição:</span>
                  <button type="button" onClick={() => setIndAtk((v) => !v)} className="px-3 py-1.5 rounded-full border font-bold text-xs" style={{ borderColor: indAtk ? "var(--accent)" : "var(--border)", backgroundColor: indAtk ? "var(--accent)" : "transparent", color: indAtk ? "var(--accent-text)" : "var(--text-primary)" }}>
                    ⚔️ ATA
                  </button>
                  <button type="button" onClick={() => setIndZag((v) => !v)} className="px-3 py-1.5 rounded-full border font-bold text-xs" style={{ borderColor: indZag ? "var(--accent)" : "var(--border)", backgroundColor: indZag ? "var(--accent)" : "transparent", color: indZag ? "var(--accent-text)" : "var(--text-primary)" }}>
                    🛡️ ZAG
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>Tipo:</span>
                  <button type="button" onClick={() => setIndType("mensalista")} className="px-3 py-1.5 rounded-full border font-bold text-xs" style={{ borderColor: indType === "mensalista" ? "var(--accent)" : "var(--border)", backgroundColor: indType === "mensalista" ? "var(--accent)" : "transparent", color: indType === "mensalista" ? "var(--accent-text)" : "var(--text-primary)" }}>
                    Mensalista
                  </button>
                  <button type="button" onClick={() => setIndType("diarista")} className="px-3 py-1.5 rounded-full border font-bold text-xs" style={{ borderColor: indType === "diarista" ? "#f59e0b" : "var(--border)", backgroundColor: indType === "diarista" ? "#f59e0b" : "transparent", color: indType === "diarista" ? "#000" : "var(--text-primary)" }}>
                    Diarista
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={handleAddIndividual} disabled={submittingPlayer} className="flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-200 hover:brightness-110 active:scale-[0.98]" style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}>
                  {submittingPlayer ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {submittingPlayer ? "Adicionando..." : "Adicionar Jogador"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  <code>NOME, NOTA, ATA</code> ou <code>NOME, F, H, D, ZAG, diarista</code>
                </p>
                <select value={loteType} onChange={(e) => setLoteType(e.target.value as PlayerType)} className="rounded p-1 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}>
                  <option value="mensalista">Mensalista Padrão</option>
                  <option value="diarista">Diarista Padrão</option>
                </select>
              </div>
              <textarea
                value={loteText}
                onChange={(e) => setLoteText(e.target.value)}
                rows={5}
                className="w-full rounded-lg p-2.5 border text-xs font-mono"
                style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                placeholder={`Neymar, 90, ATA\nCasemiro, 80, 75, 90, ZAG`}
              />
              <button type="button" onClick={handleAddLote} disabled={submittingPlayer} className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-200 hover:brightness-110 active:scale-[0.98]" style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}>
                {submittingPlayer ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {submittingPlayer ? "Importando..." : "Importar em Lote"}
              </button>
            </div>
          )}
        </section>

        {/* ===== CONFIGURACOES GLOBAIS ===== */}
        <section className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <h2 className="font-bold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Configurações (Pesos Globais)</h2>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <label className="text-xs space-y-1">
              <span style={{ color: "var(--text-secondary)" }}>Peso Físico</span>
              <input type="number" value={globalWeights.fisico} onChange={(e) => setGlobalWeights(w => ({ ...w, fisico: Number(e.target.value) }))} className="w-full p-2 rounded border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
            </label>
            <label className="text-xs space-y-1">
              <span style={{ color: "var(--text-secondary)" }}>Peso Hab</span>
              <input type="number" value={globalWeights.habilidade} onChange={(e) => setGlobalWeights(w => ({ ...w, habilidade: Number(e.target.value) }))} className="w-full p-2 rounded border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
            </label>
            <label className="text-xs space-y-1">
              <span style={{ color: "var(--text-secondary)" }}>Peso Defesa</span>
              <input type="number" value={globalWeights.defesa} onChange={(e) => setGlobalWeights(w => ({ ...w, defesa: Number(e.target.value) }))} className="w-full p-2 rounded border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
            </label>
          </div>
          <button onClick={saveSettings} disabled={savingSettings} className="w-full py-2 rounded font-bold text-xs transition-all duration-200 hover:brightness-110 active:scale-[0.98]" style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}>
            {savingSettings ? "Salvando..." : "Salvar Pesos"}
          </button>
        </section>

        </div>

        <div className="flex-1 w-full space-y-6">
        {/* ===== CRIAR RODADA ===== */}
        <section className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Plus size={16} /> Nova Rodada
          </h2>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {selectedPlayerIds.size}/{players.length} selecionados
            </span>
            <div className="flex items-center gap-2">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "name"|"overall")}
                className="text-[10px] p-1 rounded border outline-none font-bold"
                style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <option value="name">A-Z</option>
                <option value="overall">Nota Geral</option>
              </select>
              <button onClick={selectAll} className="cursor-pointer text-xs underline font-bold" style={{ color: "var(--accent)" }}>{isAllSelected ? "Desmarcar todos" : "Selecionar todos"}</button>
            </div>
          </div>

          <div className="space-y-4 max-h-[32rem] overflow-y-auto styled-scrollbar pr-2 mb-4">
            <div>
              <h3 className="text-xs font-bold mb-2 uppercase" style={{ color: "var(--text-secondary)" }}>Mensalistas</h3>
              <div className="space-y-2">
                {sortedPlayers.filter(p => p.type === "mensalista" || !p.type).map((p) => {
                  const selected = selectedPlayerIds.has(p._id);
                  const isEditing = inlineEditId === p._id;
                  const ovr = calcOverall(p.currentStats);
                  
                  if (isEditing) {
                    return (
                      <div key={p._id} className="rounded-lg border p-3 bg-black/5 dark:bg-white/5 space-y-3" style={{ borderColor: "var(--accent)" }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>Editando Jogador</span>
                          <button onClick={cancelInlineEdit} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                            <X size={16} />
                          </button>
                        </div>
                        <input value={inlineForm.name} onChange={(e) => setInlineForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome" className="w-full rounded-md p-2 text-sm border font-bold" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                        <div className="grid grid-cols-3 gap-2">
                          <label className="text-xs space-y-1"><span style={{ color: "var(--attr-fis)" }} className="font-bold">Físico</span><input type="number" value={inlineForm.fis} onChange={(e) => setInlineForm(f => ({ ...f, fis: e.target.value }))} className="w-full rounded-md p-1.5 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }} /></label>
                          <label className="text-xs space-y-1"><span style={{ color: "var(--attr-hab)" }} className="font-bold">Habilidade</span><input type="number" value={inlineForm.hab} onChange={(e) => setInlineForm(f => ({ ...f, hab: e.target.value }))} className="w-full rounded-md p-1.5 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }} /></label>
                          <label className="text-xs space-y-1"><span style={{ color: "var(--attr-def)" }} className="font-bold">Defesa</span><input type="number" value={inlineForm.def} onChange={(e) => setInlineForm(f => ({ ...f, def: e.target.value }))} className="w-full rounded-md p-1.5 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }} /></label>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setInlineForm(f => ({ ...f, atk: !f.atk }))} className="px-2 py-1 rounded border font-bold text-[10px]" style={{ borderColor: inlineForm.atk ? "var(--accent)" : "var(--border)", backgroundColor: inlineForm.atk ? "var(--accent)" : "transparent", color: inlineForm.atk ? "var(--accent-text)" : "var(--text-primary)" }}>⚔️ ATA</button>
                          <button type="button" onClick={() => setInlineForm(f => ({ ...f, zag: !f.zag }))} className="px-2 py-1 rounded border font-bold text-[10px]" style={{ borderColor: inlineForm.zag ? "var(--accent)" : "var(--border)", backgroundColor: inlineForm.zag ? "var(--accent)" : "transparent", color: inlineForm.zag ? "var(--accent-text)" : "var(--text-primary)" }}>🛡️ ZAG</button>
                          <div className="flex-1" />
                          <button onClick={() => saveInlineEdit(p._id)} disabled={savingInline} className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-50">
                            {savingInline ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Salvar
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={p._id} className="group rounded-lg border px-2 py-1.5 flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300" style={{ borderColor: selected ? "var(--accent)" : "var(--border)", backgroundColor: selected ? "rgba(0,0,0,0.15)" : "transparent" }}>
                      <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2">
                        <input type="checkbox" checked={selected} onChange={() => togglePlayer(p._id)} className="rounded w-4 h-4 shrink-0" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <p className="text-sm font-black flex items-center gap-1 flex-wrap">
                            <span className="truncate" style={{ color: "var(--text-primary)", maxWidth: "9rem" }}>{p.name}</span>
                            {p.positions.map(pos => (
                              <span key={pos} className={`text-[9px] font-bold px-1.5 rounded border uppercase ${badgeClass(pos as "ATA"|"ZAG")}`}>{pos}</span>
                            ))}
                            <span style={{ color: ratingColor(ovr) }}>{ovr.toFixed(1)}</span>
                          </p>
                          <p className="text-[11px] opacity-80" style={{ color: "var(--text-secondary)" }}>
                            <span style={{ color: "var(--attr-fis)" }}>F:{p.currentStats.fisico}</span>{" "}
                            <span style={{ color: "var(--attr-hab)" }}>H:{p.currentStats.habilidade}</span>{" "}
                            <span style={{ color: "var(--attr-def)" }}>D:{p.currentStats.defesa}</span>
                          </p>
                        </div>
                      </label>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => startInlineEdit(p)} className="p-2 rounded text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeletePlayer(p._id)} className="p-2 rounded text-zinc-400 hover:text-red-500 hover:bg-red-500/10">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold mb-2 uppercase" style={{ color: "var(--text-secondary)" }}>Diaristas</h3>
              <div className="space-y-2">
                {sortedPlayers.filter(p => p.type === "diarista").map((p) => {
                  const selected = selectedPlayerIds.has(p._id);
                  const isEditing = inlineEditId === p._id;
                  const ovr = calcOverall(p.currentStats);
                  
                  if (isEditing) {
                    return (
                      <div key={p._id} className="rounded-lg border p-3 bg-black/5 dark:bg-white/5 space-y-3" style={{ borderColor: "var(--accent)" }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>Editando Jogador</span>
                          <button onClick={cancelInlineEdit} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                            <X size={16} />
                          </button>
                        </div>
                        <input value={inlineForm.name} onChange={(e) => setInlineForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome" className="w-full rounded-md p-2 text-sm border font-bold" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                        <div className="grid grid-cols-3 gap-2">
                          <label className="text-xs space-y-1"><span style={{ color: "var(--attr-fis)" }} className="font-bold">Físico</span><input type="number" value={inlineForm.fis} onChange={(e) => setInlineForm(f => ({ ...f, fis: e.target.value }))} className="w-full rounded-md p-1.5 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }} /></label>
                          <label className="text-xs space-y-1"><span style={{ color: "var(--attr-hab)" }} className="font-bold">Habilidade</span><input type="number" value={inlineForm.hab} onChange={(e) => setInlineForm(f => ({ ...f, hab: e.target.value }))} className="w-full rounded-md p-1.5 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }} /></label>
                          <label className="text-xs space-y-1"><span style={{ color: "var(--attr-def)" }} className="font-bold">Defesa</span><input type="number" value={inlineForm.def} onChange={(e) => setInlineForm(f => ({ ...f, def: e.target.value }))} className="w-full rounded-md p-1.5 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)", color: "var(--text-primary)" }} /></label>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setInlineForm(f => ({ ...f, atk: !f.atk }))} className="px-2 py-1 rounded border font-bold text-[10px]" style={{ borderColor: inlineForm.atk ? "var(--accent)" : "var(--border)", backgroundColor: inlineForm.atk ? "var(--accent)" : "transparent", color: inlineForm.atk ? "var(--accent-text)" : "var(--text-primary)" }}>⚔️ ATA</button>
                          <button type="button" onClick={() => setInlineForm(f => ({ ...f, zag: !f.zag }))} className="px-2 py-1 rounded border font-bold text-[10px]" style={{ borderColor: inlineForm.zag ? "var(--accent)" : "var(--border)", backgroundColor: inlineForm.zag ? "var(--accent)" : "transparent", color: inlineForm.zag ? "var(--accent-text)" : "var(--text-primary)" }}>🛡️ ZAG</button>
                          <div className="flex-1" />
                          <button onClick={() => saveInlineEdit(p._id)} disabled={savingInline} className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-50">
                            {savingInline ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Salvar
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={p._id} className="group rounded-lg border px-2 py-1.5 flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 opacity-90" style={{ borderColor: selected ? "var(--accent)" : "var(--border)", backgroundColor: selected ? "rgba(0,0,0,0.15)" : "transparent" }}>
                      <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2">
                        <input type="checkbox" checked={selected} onChange={() => togglePlayer(p._id)} className="rounded w-4 h-4 shrink-0" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <p className="text-sm font-black flex items-center gap-1 flex-wrap">
                            <span className="truncate" style={{ color: "var(--text-primary)", maxWidth: "9rem" }}>{p.name}</span>
                            {p.positions.map(pos => (
                              <span key={pos} className={`text-[9px] font-bold px-1.5 rounded border uppercase ${badgeClass(pos as "ATA"|"ZAG")}`}>{pos}</span>
                            ))}
                            <span className="text-[9px] font-bold px-1.5 rounded border uppercase bg-amber-500/20 text-amber-500 border-amber-500/30">DIA</span>
                            <span style={{ color: ratingColor(ovr) }}>{ovr.toFixed(1)}</span>
                          </p>
                          <p className="text-[11px] opacity-80" style={{ color: "var(--text-secondary)" }}>
                            <span style={{ color: "var(--attr-fis)" }}>F:{p.currentStats.fisico}</span>{" "}
                            <span style={{ color: "var(--attr-hab)" }}>H:{p.currentStats.habilidade}</span>{" "}
                            <span style={{ color: "var(--attr-def)" }}>D:{p.currentStats.defesa}</span>
                          </p>
                        </div>
                      </label>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => startInlineEdit(p)} className="p-2 rounded text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeletePlayer(p._id)} className="p-2 rounded text-zinc-400 hover:text-red-500 hover:bg-red-500/10">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {players.filter(p => p.type === "diarista").length === 0 && (
                  <p className="text-xs italic" style={{ color: "var(--text-secondary)" }}>Nenhum diarista cadastrado.</p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={createRound}
            disabled={creating || selectedPlayerIds.size === 0}
            className="w-full py-3.5 cursor-pointer rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}
          >
            {creating ? <Loader2 size={18} className="animate-spin" /> : <Unlock size={18} />}
            {creating ? "Criando..." : "CRIAR RODADA"}
          </button>
        </section>

        {/* ===== RODADAS ANTERIORES ===== */}
        <section className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <h2 className="font-bold text-sm mb-3" style={{ color: "var(--text-primary)" }}>
            Rodadas Anteriores / Ativas
          </h2>
          {rounds.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Nenhuma rodada criada.</p>
          ) : (
            <div className="space-y-3">
              {rounds.map((r) => (
                <div key={r._id} className="p-3 rounded-lg border space-y-3" style={{ borderColor: "var(--border)" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        {formatRoundDate(r.createdAt)}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === "open" ? "bg-green-500/20 text-green-500" : r.status === "applied" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-500"}`}>
                          {r.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {r.playerIds.length} jogadores selecionados • {r.voteCount} votos computados
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {r.status === "open" && (
                        <button onClick={() => handleCopy(r._id)} className="cursor-pointer text-[10px] px-2 py-1.5 rounded border font-bold flex items-center gap-1 transition-colors transition-transform hover:scale-105 active:scale-95" style={{ borderColor: copiedId === r._id ? "#22c55e" : "var(--accent)", color: copiedId === r._id ? "#22c55e" : "var(--accent)", backgroundColor: copiedId === r._id ? "rgba(34,197,94,0.1)" : "transparent" }}>
                          {copiedId === r._id ? <CheckCircle2 size={12} /> : <LinkIcon size={12} />} {copiedId === r._id ? "COPIADO!" : "COPIAR LINK"}
                        </button>
                      )}
                      <Link href={`/admin/rodada/${r._id}`} className="cursor-pointer text-[10px] px-2 py-1.5 rounded border font-bold flex items-center gap-1 transition-transform hover:scale-105 active:scale-95" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
                        <Eye size={12} /> VER RODADA
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                    {r.status === "open" && (
                      <button onClick={() => updateRoundStatus(r._id, "close")} className="cursor-pointer text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: "#27272a", color: "#f4f4f5" }}>
                        <XCircle size={12}/> FECHAR
                      </button>
                    )}
                    {r.status === "closed" && (
                      <>
                        <button onClick={() => updateRoundStatus(r._id, "open")} className="cursor-pointer text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: "rgba(20,83,45,0.8)", color: "#bbf7d0" }}>
                          <Unlock size={12}/> REABRIR
                        </button>
                        <button onClick={() => updateRoundStatus(r._id, "apply")} className="cursor-pointer text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: "rgba(30,58,138,0.8)", color: "#bfdbfe" }}>
                          <CheckCircle2 size={12}/> REGISTRAR VOTOS NO BANCO
                        </button>
                      </>
                    )}
                    {r.status === "applied" && (
                      <>
                        <button onClick={() => updateRoundStatus(r._id, "open")} className="cursor-pointer text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: "rgba(20,83,45,0.8)", color: "#bbf7d0" }}>
                          <Unlock size={12}/> REABRIR
                        </button>
                        <button onClick={() => updateRoundStatus(r._id, "apply")} className="cursor-pointer text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: "rgba(30,58,138,0.8)", color: "#bfdbfe" }}>
                          <CheckCircle2 size={12}/> REAPLICAR NOTAS NO BANCO
                        </button>
                      </>
                    )}
                    <div className="flex-1" />
                    <button onClick={() => handleDeleteRound(r._id)} className="cursor-pointer text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: "rgba(127,29,29,0.8)", color: "#fca5a5" }}>
                      <Trash2 size={12}/> DELETAR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        </div>
      </div>
    </main>
  );
}

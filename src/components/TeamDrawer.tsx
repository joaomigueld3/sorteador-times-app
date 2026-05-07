"use client";

import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Copy, Shuffle, Trash2, Users } from "lucide-react";

type DrawMode = "teams" | "players";
type SortMode = "alpha" | "rating";
type Role = "atk" | "def";

interface SourcePlayer {
  _id?: string;
  id?: string;
  name: string;
  positions: string[];
  currentStats: { fisico: number; habilidade: number; defesa: number };
}

interface TeamDrawerProps {
  players: SourcePlayer[];
}

interface InternalPlayer {
  id: string;
  name: string;
  attributes: { fisico: number; habilidade: number; defesa: number };
  roles: Role[];
}

interface TeamMember extends InternalPlayer {
  currentOvr: number;
  sortValue: number;
}

interface SortablePlayerRowProps {
  player: TeamMember;
  scoreLabel: string;
  attrsLabel: React.ReactNode;
}

function SortablePlayerRow({ player, scoreLabel, attrsLabel }: SortablePlayerRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: player.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="text-xs rounded-md px-2 py-2 flex items-center justify-between touch-none"
    >
      <div className="min-w-0">
        <span className="truncate block">{player.name} {player.roles.includes("atk") ? "⚔️" : ""}{player.roles.includes("def") ? "🛡️" : ""}</span>
        <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{attrsLabel}</span>
      </div>
      <span className="font-bold">{scoreLabel}</span>
    </div>
  );
}

function TeamDropZone({ id, children }: { id: string; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`p-2 space-y-1 min-h-20 rounded-b-md ${isOver ? "ring-1 ring-white/30" : ""}`}>
      {children}
    </div>
  );
}

const STORAGE_KEY = "players_pro_v17";

const toTensScale = (value: number) => {
  const normalizedBase = value <= 10 ? value * 10 : value;
  const rounded = Math.round(normalizedBase / 10) * 10;
  if (rounded < 10) return 10;
  if (rounded > 100) return 100;
  return rounded;
};

const roleFromPositions = (positions: string[]): Role[] => {
  const roles: Role[] = [];
  if (positions.includes("ATA")) roles.push("atk");
  if (positions.includes("ZAG") || positions.includes("GOL")) roles.push("def");
  return roles;
};

const toInternal = (players: SourcePlayer[]): InternalPlayer[] =>
  players.map((p) => ({
    id: p._id || p.id || crypto.randomUUID(),
    name: p.name,
    attributes: {
      fisico: toTensScale(p.currentStats.fisico),
      habilidade: toTensScale(p.currentStats.habilidade),
      defesa: toTensScale(p.currentStats.defesa),
    },
    roles: roleFromPositions(p.positions),
  }));

export default function TeamDrawer({ players }: TeamDrawerProps) {
  const [pool, setPool] = useState<InternalPlayer[]>(() => {
    if (typeof window === "undefined") return toInternal(players);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as InternalPlayer[];
    return toInternal(players);
  });

  const [weights, setWeights] = useState({ fis: "40", hab: "35", def: "25" });
  const [randomFactor, setRandomFactor] = useState(10);
  const [drawMode, setDrawMode] = useState<DrawMode>("teams");
  const [drawValue, setDrawValue] = useState("4");
  const [sortMode, setSortMode] = useState<SortMode>("alpha");
  const [selectedIds, setSelectedIds] = useState<string[]>(() => pool.map((p) => p.id));
  const [teams, setTeams] = useState<TeamMember[][]>([]);
  const [copied, setCopied] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [showBank, setShowBank] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [name, setName] = useState("");
  const [fis, setFis] = useState("70");
  const [hab, setHab] = useState("70");
  const [def, setDef] = useState("70");
  const [atk, setAtk] = useState(false);
  const [defRole, setDefRole] = useState(false);

  const teamsSectionRef = useRef<HTMLElement | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  );

  const normalizeName = (value: string) => value.trim().toLocaleLowerCase("pt-BR");

  const normalizeStat = (value: number) => toTensScale(value);

  const normalizedAttrs = (attrs: InternalPlayer["attributes"]) => ({
    fisico: normalizeStat(attrs.fisico),
    habilidade: normalizeStat(attrs.habilidade),
    defesa: normalizeStat(attrs.defesa),
  });

  const parsedWeights = {
    fis: Number(weights.fis) || 0,
    hab: Number(weights.hab) || 0,
    def: Number(weights.def) || 0,
  };

  const calcOverall = (attrs: InternalPlayer["attributes"]) => {
    const normalized = normalizedAttrs(attrs);
    const wf = parsedWeights.fis / 100;
    const wh = parsedWeights.hab / 100;
    const wd = parsedWeights.def / 100;
    return normalized.fisico * wf + normalized.habilidade * wh + normalized.defesa * wd;
  };

  const persist = (next: InternalPlayer[]) => {
    setPool(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const sortedPlayers = useMemo(() => {
    const cloned = [...pool];
    return cloned.sort((a, b) => {
      if (sortMode === "rating") {
        const diff = calcOverall(b.attributes) - calcOverall(a.attributes);
        if (Math.abs(diff) > 0.0001) return diff;
      }
      return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
    });
  }, [pool, sortMode, weights]);

  const addSingle = () => {
    if (!name.trim()) return;
    if (pool.some((p) => normalizeName(p.name) === normalizeName(name))) {
      alert("Ja existe jogador com esse nome.");
      return;
    }
    const nf = Number(fis);
    const nh = Number(hab);
    const nd = Number(def);
    if ([nf, nh, nd].some((v) => Number.isNaN(v) || v < 0 || v > 100)) return;

    const roles: Role[] = [];
    if (atk) roles.push("atk");
    if (defRole) roles.push("def");

    const next = [
      ...pool,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        attributes: { fisico: toTensScale(nf), habilidade: toTensScale(nh), defesa: toTensScale(nd) },
        roles,
      },
    ];
    persist(next);
    setSelectedIds((prev) => [...prev, next[next.length - 1].id]);
    setName("");
  };

  const importBulk = () => {
    const text = bulkInput.trim();
    if (!text) return;
    const parsed: InternalPlayer[] = [];

    text.split("\n").forEach((line) => {
      const parts = line.split(/[;,]/).map((p) => p.trim()).filter(Boolean);
      if (parts.length < 2) return;
      const playerName = parts[0];
      if (pool.some((p) => normalizeName(p.name) === normalizeName(playerName))) return;
      if (parsed.some((p) => normalizeName(p.name) === normalizeName(playerName))) return;
      let nf = Number(parts[1]);
      let nh = Number(parts[1]);
      let nd = Number(parts[1]);
      let rolePart = parts[2] || "";

      if (parts.length >= 4) {
        nf = Number(parts[1]);
        nh = Number(parts[2]);
        nd = Number(parts[3]);
        rolePart = parts[4] || "";
      }

      if ([nf, nh, nd].some((v) => Number.isNaN(v))) return;

      const roles: Role[] = [];
      if (rolePart.toUpperCase().includes("ATA")) roles.push("atk");
      if (rolePart.toUpperCase().includes("ZAG")) roles.push("def");

      parsed.push({
        id: crypto.randomUUID(),
        name: playerName,
        attributes: { fisico: toTensScale(nf), habilidade: toTensScale(nh), defesa: toTensScale(nd) },
        roles,
      });
    });

    if (!parsed.length) return;
    persist([...pool, ...parsed]);
    setSelectedIds((prev) => [...prev, ...parsed.map((p) => p.id)]);
    setBulkInput("");
  };

  const clearAll = () => {
    if (!confirm("Apagar permanentemente todos os jogadores do sorteador?")) return;
    persist([]);
    setSelectedIds([]);
    setTeams([]);
  };

  const removeOne = (id: string) => {
    const next = pool.filter((p) => p.id !== id);
    persist(next);
    setSelectedIds((prev) => prev.filter((v) => v !== id));
    setTeams((prev) => prev.map((team) => team.filter((p) => p.id !== id)));
  };

  const buildTeams = () => {
    const active = pool.filter((p) => selectedIds.includes(p.id));
    if (active.length < 2) return alert("Selecione no minimo 2 jogadores.");

    const parsedDrawValue = Number(drawValue) || 2;
    const teamCount = drawMode === "teams" ? Math.max(2, parsedDrawValue) : Math.max(2, Math.ceil(active.length / Math.max(1, parsedDrawValue)));
    if (active.length < teamCount) return alert("Jogadores insuficientes para essa configuracao.");

    const randomScale = randomFactor / 10;
    const decorated: TeamMember[] = active
      .map((p) => {
        const currentOvr = calcOverall(p.attributes);
        const sortValue = currentOvr + Math.random() * randomScale;
        return { ...p, currentOvr, sortValue };
      });

    const attackers = decorated.filter((p) => p.roles.includes("atk") && !p.roles.includes("def"));
    const defenders = decorated.filter((p) => p.roles.includes("def") && !p.roles.includes("atk"));
    const versatile = decorated.filter((p) => !attackers.includes(p) && !defenders.includes(p));

    const nextTeams: TeamMember[][] = Array.from({ length: teamCount }, () => []);
    const teamPower = (team: TeamMember[]) => team.reduce((sum, p) => sum + p.currentOvr, 0);
    const teamAttrPower = (team: TeamMember[], attr: "fisico" | "habilidade" | "defesa") =>
      team.reduce((sum, p) => sum + normalizedAttrs(p.attributes)[attr], 0);
    const teamRoleCount = (team: TeamMember[], role: Role) => team.filter((p) => p.roles.includes(role)).length;
    const teamSizeLimit = Math.ceil(active.length / teamCount);

    const getTeamScore = (team: TeamMember[], player: TeamMember) => {
      const projectedSize = team.length + 1;
      const projectedPower = teamPower(team) + player.currentOvr;
      const projectedFis = teamAttrPower(team, "fisico") + normalizedAttrs(player.attributes).fisico;
      const projectedHab = teamAttrPower(team, "habilidade") + normalizedAttrs(player.attributes).habilidade;
      const projectedDef = teamAttrPower(team, "defesa") + normalizedAttrs(player.attributes).defesa;
      const atkPenalty = player.roles.includes("atk") ? teamRoleCount(team, "atk") * 1.35 : 0;
      const defPenalty = player.roles.includes("def") ? teamRoleCount(team, "def") * 1.35 : 0;
      const sizePenalty = projectedSize > teamSizeLimit ? 50 : projectedSize * 0.25;

      return projectedPower * 3.2 + projectedFis * 0.45 + projectedHab * 0.45 + projectedDef * 0.45 + atkPenalty + defPenalty + sizePenalty;
    };

    const allocate = (group: TeamMember[]) => {
      [...group]
        .sort((a, b) => b.sortValue - a.sortValue)
        .forEach((player) => {
          const target = nextTeams
            .map((team, idx) => ({ idx, size: team.length, score: getTeamScore(team, player) }))
            .sort((a, b) => {
              if (a.size !== b.size) return a.size - b.size;
              if (Math.abs(a.score - b.score) > 0.0001) return a.score - b.score;
              return a.idx - b.idx;
            })[0];
          nextTeams[target.idx].push(player);
        });
    };

    allocate(attackers);
    allocate(defenders);
    allocate(versatile);

    const balanceQuality = (candidateTeams: TeamMember[][]) => {
      const powers = candidateTeams.map(teamPower);
      const avgPower = powers.reduce((sum, value) => sum + value, 0) / powers.length;
      const powerSpread = Math.max(...powers) - Math.min(...powers);
      const powerVariance = powers.reduce((sum, value) => sum + Math.pow(value - avgPower, 2), 0) / powers.length;
      const roleSpread = (["atk", "def"] as const).reduce((sum, role) => {
        const counts = candidateTeams.map((team) => teamRoleCount(team, role));
        return sum + (Math.max(...counts) - Math.min(...counts));
      }, 0);
      return powerVariance * 1.6 + powerSpread * 0.9 + roleSpread * 1.2;
    };

    const tryImproveBySwapping = () => {
      let improved = false;
      let bestQuality = balanceQuality(nextTeams);
      for (let a = 0; a < nextTeams.length; a++) {
        for (let b = a + 1; b < nextTeams.length; b++) {
          for (let i = 0; i < nextTeams[a].length; i++) {
            for (let j = 0; j < nextTeams[b].length; j++) {
              [nextTeams[a][i], nextTeams[b][j]] = [nextTeams[b][j], nextTeams[a][i]];
              const newQuality = balanceQuality(nextTeams);
              if (newQuality + 0.0001 < bestQuality) {
                bestQuality = newQuality;
                improved = true;
              } else {
                [nextTeams[a][i], nextTeams[b][j]] = [nextTeams[b][j], nextTeams[a][i]];
              }
            }
          }
        }
      }
      return improved;
    };

    for (let pass = 0; pass < 12; pass++) {
      if (!tryImproveBySwapping()) break;
    }

    return nextTeams;
  };

  const handleDraw = () => {
    const nextTeams = buildTeams();
    if (!nextTeams) return;
    setTeams(nextTeams);
    setTimeout(() => {
      teamsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const movePlayer = (fromIdx: number, toIdx: number, playerId: string) => {
    if (fromIdx === toIdx) return;
    setTeams((prev) => {
      const next = prev.map((t) => [...t]);
      const pIdx = next[fromIdx].findIndex((p) => p.id === playerId);
      if (pIdx < 0) return prev;
      const [moved] = next[fromIdx].splice(pIdx, 1);
      next[toIdx].push(moved);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const fromIdx = teams.findIndex((team) => team.some((p) => p.id === activeId));
    if (fromIdx < 0) return;

    const toIdx = overId.startsWith("team-")
      ? Number(overId.replace("team-", ""))
      : teams.findIndex((team) => team.some((p) => p.id === overId));

    if (toIdx < 0 || toIdx === fromIdx) return;
    movePlayer(fromIdx, toIdx, activeId);
  };

  const shareText = useMemo(() => {
    let text = "⚽ *SORTEIO DE TIMES PRO* ⚽\n\n";
    teams.forEach((team, i) => {
      const avg = team.length ? team.reduce((s, p) => s + calcOverall(p.attributes), 0) / team.length : 0;
      text += `${i % 2 === 0 ? "🔵" : "🔴"} *TIME ${i + 1}* (Media: ${avg.toFixed(1)})\n`;
      [...team]
        .sort((a, b) => calcOverall(b.attributes) - calcOverall(a.attributes))
        .forEach((p) => {
          const label = [p.roles.includes("atk") ? "ATA" : "", p.roles.includes("def") ? "ZAG" : ""].filter(Boolean).join("+");
          text += `▫️ ${p.name.toUpperCase()} ${label ? `[${label}]` : ""} (${calcOverall(p.attributes).toFixed(1)}) [F:${p.attributes.fisico} H:${p.attributes.habilidade} D:${p.attributes.defesa}]\n`;
        });
      text += "\n";
    });
    return `${text}_Gerado via Sorteador Pro_`;
  }, [teams, weights]);

  const copy = async () => {
    if (!teams.length) return;
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const teamMetrics = useMemo(() => {
    const base = teams.map((team) => {
      const sum = team.reduce((s, p) => s + calcOverall(p.attributes), 0);
      const count = team.length;
      const avg = count ? sum / count : 0;
      return { sum, count, avg };
    });

    const globalAvg = base.length ? base.reduce((s, t) => s + t.avg, 0) / base.length : 0;

    return {
      globalAvg,
      byTeam: base.map((current) => ({
        ...current,
        diff: current.avg - globalAvg,
      })),
    };
  }, [teams, weights]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
      <section className="rounded-xl border p-2.5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <button type="button" onClick={() => setShowSettings((v) => !v)} className="text-sm font-bold mb-2 flex items-center gap-2">
          <span>{showSettings ? "▾" : "▸"}</span> Definicoes do sorteio
        </button>
        {showSettings && <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <label className="space-y-1">
            <span style={{ color: "var(--text-secondary)" }}>Peso Fisico</span>
            <input type="number" value={weights.fis} onChange={(e) => setWeights((w) => ({ ...w, fis: e.target.value }))} className="w-full rounded-md p-2 border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
          </label>
          <label className="space-y-1">
            <span style={{ color: "var(--text-secondary)" }}>Peso Habilidade</span>
            <input type="number" value={weights.hab} onChange={(e) => setWeights((w) => ({ ...w, hab: e.target.value }))} className="w-full rounded-md p-2 border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
          </label>
          <label className="space-y-1">
            <span style={{ color: "var(--text-secondary)" }}>Peso Defesa</span>
            <input type="number" value={weights.def} onChange={(e) => setWeights((w) => ({ ...w, def: e.target.value }))} className="w-full rounded-md p-2 border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-3">
          <label className="space-y-1">
            <span style={{ color: "var(--text-secondary)" }}>Aleatoriedade: {randomFactor}%</span>
            <input type="range" min={0} max={100} value={randomFactor} onChange={(e) => setRandomFactor(Number(e.target.value))} className="w-full" />
          </label>
          <label className="space-y-1">
            <span style={{ color: "var(--text-secondary)" }}>Modo de sorteio</span>
            <select value={drawMode} onChange={(e) => setDrawMode(e.target.value as DrawMode)} className="w-full rounded-md p-2 border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }}>
              <option value="teams">Quantidade de times</option>
              <option value="players">Jogadores por time</option>
            </select>
          </label>
          <label className="space-y-1">
            <span style={{ color: "var(--text-secondary)" }}>{drawMode === "teams" ? "Qtd. de times" : "Jogadores/time"}</span>
            <input type="number" value={drawValue} onChange={(e) => setDrawValue(e.target.value)} className="w-full rounded-md p-2 border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
          </label>
        </div>
        </>}
      </section>

      <section className="rounded-xl border p-2.5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <button type="button" onClick={() => setShowRegister((v) => !v)} className="text-sm font-bold mb-2 flex items-center gap-2"><span>{showRegister ? "▾" : "▸"}</span>Cadastro</button>
        {showRegister && <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="text-sm font-bold">Cadastro individual</div>
          <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Notas de 0 a 100</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="NOME" className="w-full rounded-md p-2 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
          <div className="grid grid-cols-3 gap-2">
            <input value={fis} onChange={(e) => setFis(e.target.value)} placeholder="FIS" className="rounded-md p-2 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
            <input value={hab} onChange={(e) => setHab(e.target.value)} placeholder="HAB" className="rounded-md p-2 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
            <input value={def} onChange={(e) => setDef(e.target.value)} placeholder="DEF" className="rounded-md p-2 text-xs border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} />
          </div>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => setAtk((v) => !v)}
              className="px-2.5 py-1.5 rounded-full border font-bold text-xs"
              style={{
                borderColor: atk ? "var(--accent)" : "var(--border)",
                backgroundColor: atk ? "var(--accent)" : "transparent",
                color: atk ? "var(--accent-text)" : "var(--text-primary)",
              }}
            >
              ⚔️ ATA
            </button>
            <button
              type="button"
              onClick={() => setDefRole((v) => !v)}
              className="px-2.5 py-1.5 rounded-full border font-bold text-xs"
              style={{
                borderColor: defRole ? "var(--accent)" : "var(--border)",
                backgroundColor: defRole ? "var(--accent)" : "transparent",
                color: defRole ? "var(--accent-text)" : "var(--text-primary)",
              }}
            >
              🛡️ ZAG
            </button>
          </div>
          <button onClick={addSingle} className="px-3 py-2 rounded-md font-bold text-xs" style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}>Adicionar</button>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-bold">Cadastro em lote</div>
          <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} rows={5} className="w-full rounded-md p-2 border text-xs" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }} placeholder="NOME, NOTA, ATA&#10;NOME, F, H, D, ZAG" />
          <button onClick={importBulk} className="px-3 py-2 rounded-md font-bold text-xs border" style={{ borderColor: "var(--border)" }}>Importar</button>
        </div>
        </div>}
      </section>
      </div>

      <section className="rounded-xl border p-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={() => setShowBank((v) => !v)} className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--text-primary)" }}><span>{showBank ? "▾" : "▸"}</span><Users size={16} /> Banco de jogadores ({pool.length})</button>
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} className="rounded-md p-1 border" style={{ backgroundColor: "var(--bg-page)", borderColor: "var(--border)" }}>
              <option value="alpha">Alfabetica</option>
              <option value="rating">Nota do jogador</option>
            </select>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={selectedIds.length === pool.length && pool.length > 0} onChange={(e) => setSelectedIds(e.target.checked ? pool.map((p) => p.id) : [])} /> Todos
            </label>
            <button onClick={clearAll} className="px-2 py-1 rounded-md border text-red-400" style={{ borderColor: "var(--border)" }}>
              Limpar
            </button>
            <button onClick={handleDraw} className="px-3 py-1.5 rounded-md font-bold text-xs flex items-center gap-1.5" style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}>
              <Shuffle size={14} /> Gerar times
            </button>
          </div>
        </div>
        {showBank && <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {sortedPlayers.map((p) => (
            <label key={p.id} className="rounded-lg border p-2 flex items-center justify-between gap-2" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 min-w-0">
                <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={(e) => setSelectedIds((prev) => (e.target.checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)))} />
                <div className="min-w-0">
                  <p className="text-xs font-black truncate">{p.name} {p.roles.includes("atk") ? "⚔️" : ""}{p.roles.includes("def") ? "🛡️" : ""}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--attr-fis)" }}>F:{normalizedAttrs(p.attributes).fisico}</span>{" "}
                    <span style={{ color: "var(--attr-hab)" }}>H:{normalizedAttrs(p.attributes).habilidade}</span>{" "}
                    <span style={{ color: "var(--attr-def)" }}>D:{normalizedAttrs(p.attributes).defesa}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-black" style={{ color: "var(--accent)" }}>{calcOverall(p.attributes).toFixed(1)}</div>
                <button type="button" onClick={() => removeOne(p.id)} className="text-red-400 hover:text-red-300" aria-label="Apagar jogador">×</button>
              </div>
            </label>
          ))}
        </div>}
      </section>

      {teams.length > 0 && (
        <section ref={teamsSectionRef}>
          <div className="flex justify-end mb-2 gap-2 flex-wrap">
            <button onClick={handleDraw} className="px-4 py-2 rounded-lg font-bold text-sm border flex items-center gap-2" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
              <Shuffle size={16} /> Gerar novamente
            </button>
            <button onClick={copy} disabled={!teams.length} className="px-4 py-2 rounded-lg font-bold text-sm border disabled:opacity-50 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
              <Copy size={16} /> {copied ? "Copiado" : "Copiar times"}
            </button>
          </div>
          <div className="mb-2 text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
            Media geral dos times: <span style={{ color: "var(--accent)" }}>{teamMetrics.globalAvg.toFixed(1)}</span>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {teams.map((team, idx) => {
              const avg = teamMetrics.byTeam[idx]?.avg ?? 0;
              const diff = teamMetrics.byTeam[idx]?.diff ?? 0;
              const diffLabel = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}`;
              const diffColor = diff > 0 ? "#60a5fa" : diff < 0 ? "#f87171" : "var(--text-secondary)";

              const avgFis = team.length ? team.reduce((s, p) => s + normalizedAttrs(p.attributes).fisico, 0) / team.length : 0;
              const avgHab = team.length ? team.reduce((s, p) => s + normalizedAttrs(p.attributes).habilidade, 0) / team.length : 0;
              const avgDef = team.length ? team.reduce((s, p) => s + normalizedAttrs(p.attributes).defesa, 0) / team.length : 0;

              return (
                <div key={idx} className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
                  <div className="p-2 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                    <span className="text-xs font-black">Time {idx + 1}</span>
                    <span className="text-xs font-black" style={{ color: "var(--accent)" }}>
                      NOT: {avg.toFixed(1)} <span style={{ color: diffColor }}>({diffLabel})</span>
                    </span>
                  </div>
                  <div className="px-2 py-1 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--attr-fis)" }}>F:{avgFis.toFixed(1)}</span>{" "}
                    <span style={{ color: "var(--attr-hab)" }}>H:{avgHab.toFixed(1)}</span>{" "}
                    <span style={{ color: "var(--attr-def)" }}>D:{avgDef.toFixed(1)}</span>
                  </div>
                  <SortableContext items={team.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    <TeamDropZone id={`team-${idx}`}>
                      {[...team].sort((a, b) => calcOverall(b.attributes) - calcOverall(a.attributes)).map((p) => (
                        <div key={p.id} style={{ backgroundColor: "var(--bg-page)" }} className="rounded-md">
                          <SortablePlayerRow
                            player={p}
                            scoreLabel={calcOverall(p.attributes).toFixed(1)}
                            attrsLabel={
                              <>
                                <span style={{ color: "var(--attr-fis)" }}>F:{normalizedAttrs(p.attributes).fisico}</span>{" "}
                                <span style={{ color: "var(--attr-hab)" }}>H:{normalizedAttrs(p.attributes).habilidade}</span>{" "}
                                <span style={{ color: "var(--attr-def)" }}>D:{normalizedAttrs(p.attributes).defesa}</span>
                              </>
                            }
                          />
                        </div>
                      ))}
                    </TeamDropZone>
                  </SortableContext>
                  <div className="px-2 py-1 border-t text-[10px] font-bold text-center" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                    {team.length} jogadores
                  </div>
                </div>
              );
            })}
          </div>
          </DndContext>
        </section>
      )}
    </div>
  );
}

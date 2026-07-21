"use client";

import { useState } from "react";
import { Player, PlayerAttributes, calculateOverall } from "../data/mocks";
import { ChevronDown, ChevronUp, Shield, Zap, Activity } from "lucide-react";

interface VotingCardProps {
  player: Player;
  onVoteChange: (id: string, votes: PlayerAttributes) => void;
  isSelf?: boolean;
}

// Interface para o componente filho (Corrige o erro de tipo implícito)
interface CompactRowProps {
  label: string;
  icon: React.ReactNode;
  val: number;
  color: string;
  onChange: (value: number) => void;
}

export default function VotingCard({ player, onVoteChange, isSelf }: VotingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<PlayerAttributes>(player.currentStats);
  
  // Recalcula o overall visualmente
  const currentOverall = calculateOverall(stats);
  const ratingColor = (value: number) => {
    if (value < 50) return "#ef4444";
    if (value < 60) return "#f97316";
    if (value < 70) return "#eab308";
    if (value < 80) return "#22c55e";
    if (value < 90) return "#38bdf8";
    return "#a78bfa";
  };

  const handleUpdate = (newStats: PlayerAttributes) => {
    setStats(newStats);
    onVoteChange(player.id, newStats);
  };

  const getPositionColor = (pos: string) => {
    if (pos === 'ATA') return 'bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/30';
    if (pos === 'ZAG') return 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30';
    if (pos === 'GOL') return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border-yellow-500/30';
    return 'bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/30';
  };

  return (
    <div 
      className={`rounded-lg border transition-all duration-200 overflow-hidden shadow-sm
      ${isSelf ? 'ring-2 ring-[var(--accent)]' : ''}`}
      style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderColor: 'var(--border)' 
      }}
    >
      {/* HEADER COMPACTO */}
      <div className="p-3 flex items-center gap-3">
        {/* Avatar Mini */}
        <div 
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          {player.name.substring(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {player.name}
              </h3>
              <div className="flex gap-0.5 shrink-0">
                {player.positions.map((pos) => (
                  <span key={pos} className={`text-[9px] font-bold px-1.5 rounded border ${getPositionColor(pos)}`}>
                    {pos}
                  </span>
                ))}
              </div>
            </div>
            <span className="font-bold text-lg leading-none" style={{ color: ratingColor(currentOverall) }}>
              {currentOverall}
            </span>
          </div>
          
          {/* Slider Principal */}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={currentOverall}
              onChange={(e) => {
                const val = Number(e.target.value);
                handleUpdate({ fisico: val, habilidade: val, defesa: val });
              }}
              className="w-full block"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={currentOverall}
              onChange={(e) => {
                const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                handleUpdate({ fisico: val, habilidade: val, defesa: val });
              }}
              className="w-14 rounded border px-1.5 py-0.5 text-[11px]"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-black/5 rounded text-[var(--text-secondary)] transition-colors flex flex-col items-center gap-0.5"
        >
          {isExpanded ? <ChevronUp size={18} /> : <><span className="text-[9px] leading-none font-medium">Ajuste</span><ChevronDown size={14} /></>}
        </button>
      </div>

      {/* EXPANDIDO (Mais compacto) */}
      {isExpanded && (
        <div className="p-3 border-t space-y-3 bg-black/5" style={{ borderColor: 'var(--border)' }}>
          {/* CORREÇÃO AQUI: Tipagem explicita (v: number) */}
          <CompactRow 
            label="FIS (40%)" 
            icon={<Activity size={14}/>} 
            color="var(--attr-fis)"
            val={stats.fisico} 
            onChange={(v: number) => handleUpdate({...stats, fisico: v})} 
          />
          <CompactRow 
            label="HAB (35%)" 
            icon={<Zap size={14}/>} 
            color="var(--attr-hab)"
            val={stats.habilidade} 
            onChange={(v: number) => handleUpdate({...stats, habilidade: v})} 
          />
          <CompactRow 
            label="DEF (25%)" 
            icon={<Shield size={14}/>} 
            color="var(--attr-def)"
            val={stats.defesa} 
            onChange={(v: number) => handleUpdate({...stats, defesa: v})} 
          />
        </div>
      )}
    </div>
  );
}

// Componente auxiliar tipado corretamente
const CompactRow = ({ label, icon, val, color, onChange }: CompactRowProps) => (
  <div className="flex items-center gap-3 text-xs">
    <div className="flex items-center gap-2 w-24 shrink-0" style={{ color }}>
      {icon} <span className="font-medium">{label}</span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value={val}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1"
    />
    <input
      type="number"
      min="0"
      max="100"
      value={val}
      onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
      className="w-14 rounded border px-1.5 py-0.5 text-[11px]"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    />
    <span className="w-8 text-right font-bold" style={{ color: 'var(--text-primary)' }}>{val}</span>
  </div>
);

"use client";

import { useState } from "react";
import { Player, PlayerAttributes, calculateOverall } from "../data/mocks";
import { ChevronDown, ChevronUp, Shield, Zap, Activity, Calculator } from "lucide-react";

interface VotingCardProps {
  player: Player;
  onVoteChange: (id: string, votes: PlayerAttributes) => void;
  isSelf?: boolean; // Se for o próprio usuário, destaca diferente
}

export default function VotingCard({ player, onVoteChange, isSelf }: VotingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<PlayerAttributes>(player.currentStats);

  // Média Ponderada
  const currentOverall = calculateOverall(stats);

  const handleOverallChange = (value: number) => {
    const safeValue = Math.min(100, Math.max(0, value));
    // No modo "Overall", aplicamos o mesmo valor para tudo por simplicidade de UX
    const newStats = { fisico: safeValue, habilidade: safeValue, defesa: safeValue };
    setStats(newStats);
    onVoteChange(player.id, newStats);
  };

  const handleAttributeChange = (key: keyof PlayerAttributes, value: number) => {
    const safeValue = Math.min(100, Math.max(0, value));
    const newStats = { ...stats, [key]: safeValue };
    setStats(newStats);
    onVoteChange(player.id, newStats);
  };

  const getPositionColor = (pos: string) => {
    if (pos === 'ATA') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (pos === 'ZAG') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (pos === 'GOL') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-neon-400/20 text-neon-400 border-neon-400/30';
  };

  return (
    <div className={`rounded-xl border transition-all duration-300 mb-3 overflow-hidden
      ${isSelf ? 'bg-dark-800 border-neon-400 shadow-[0_0_15px_rgba(204,255,0,0.15)]' : 'bg-dark-800 border-dark-700 shadow-sm'}`}
    >
      {/* HEADER */}
      <div className="p-4 flex items-center gap-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2
          ${isSelf ? 'bg-neon-400 text-dark-900 border-neon-400' : 'bg-dark-700 text-gray-400 border-transparent'}`}>
          {player.name.substring(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className={`font-bold text-sm truncate ${isSelf ? 'text-neon-400' : 'text-gray-200'}`}>
              {player.name} {isSelf && "(Você)"}
            </h3>
            <div className="flex gap-1 shrink-0">
              {player.positions.map((pos) => (
                <span key={pos} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPositionColor(pos)}`}>
                  {pos}
                </span>
              ))}
            </div>
          </div>
          
          {/* CONTROLES */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              value={currentOverall}
              onChange={(e) => handleOverallChange(Number(e.target.value))}
              className="flex-1 h-1.5 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-neon-400 hover:accent-neon-500"
            />
            <div className="relative">
              <input 
                type="number" 
                value={currentOverall}
                onChange={(e) => handleOverallChange(Number(e.target.value))}
                className="w-12 h-8 text-center text-sm font-bold border border-dark-600 rounded bg-dark-900 text-white focus:ring-1 focus:ring-neon-400 outline-none"
              />
              {/* Indicador visual de média ponderada */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-neon-400 rounded-full animate-pulse" title="Média Ponderada Automática" />
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 -mr-2 text-gray-500 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* EXPANDIDO */}
      {isExpanded && (
        <div className="bg-dark-900/50 p-4 border-t border-dark-700 space-y-4 animate-in slide-in-from-top-1">
          <AttributeRow 
            label="Físico" 
            weight="40%"
            desc="Velocidade, Resistência"
            icon={<Activity size={14} className="text-orange-400"/>} 
            value={stats.fisico} 
            onChange={(v: number) => handleAttributeChange('fisico', v)} 
          />
          <AttributeRow 
            label="Habilidade" 
            weight="35%"
            desc="Chute, Passe, Drible"
            icon={<Zap size={14} className="text-neon-400"/>} 
            value={stats.habilidade} 
            onChange={(v: number) => handleAttributeChange('habilidade', v)} 
          />
          <AttributeRow 
            label="Defesa" 
            weight="25%"
            desc="Marcação, Desarme"
            icon={<Shield size={14} className="text-blue-400"/>} 
            value={stats.defesa} 
            onChange={(v: number) => handleAttributeChange('defesa', v)} 
          />
        </div>
      )}
    </div>
  );
}

const AttributeRow = ({ label, weight, desc, icon, value, onChange }: any) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-[9px] bg-dark-700 text-gray-400 px-1 rounded">{weight}</span>
      </div>
      <span className="text-[10px] text-gray-500">{desc}</span>
    </div>
    
    <div className="flex items-center gap-3">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-gray-400"
      />
      <input 
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-10 h-7 text-center text-xs border border-dark-600 rounded bg-dark-900 text-gray-300 focus:border-neon-400 outline-none"
      />
    </div>
  </div>
);
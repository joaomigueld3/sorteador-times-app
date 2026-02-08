"use client";

import { useState, useEffect } from "react";
import { Player, PlayerAttributes } from "../data/mocks"; // Ajuste o caminho se necessário
import { ChevronDown, ChevronUp, Shield, Zap, Activity } from "lucide-react";

interface VotingCardProps {
  player: Player;
  onVoteChange: (id: string, votes: PlayerAttributes) => void;
}

export default function VotingCard({ player, onVoteChange }: VotingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<PlayerAttributes>(player.currentStats);

  // Calcula média visual (arredondada)
  const currentOverall = Math.round(
    (stats.fisico + stats.habilidade + stats.defesa) / 3
  );

  const handleOverallChange = (value: number) => {
    const safeValue = Math.min(100, Math.max(0, value));
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
    if (pos === 'ATA') return 'bg-red-100 text-red-700 border-red-200';
    if (pos === 'ZAG') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (pos === 'GOL') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-3">
      {/* HEADER COMPACTO */}
      <div className="p-3 flex items-center gap-3">
        {/* Avatar/Initials */}
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0">
          {player.name.substring(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-800 text-sm truncate">{player.name}</h3>
            <div className="flex gap-1 shrink-0">
              {player.positions.map((pos) => (
                <span key={pos} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${getPositionColor(pos)}`}>
                  {pos}
                </span>
              ))}
            </div>
          </div>
          
          {/* CONTROLE GERAL (HÍBRIDO) */}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={currentOverall}
              onChange={(e) => handleOverallChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <input 
              type="number" 
              value={currentOverall}
              onChange={(e) => handleOverallChange(Number(e.target.value))}
              className="w-12 h-8 text-center text-sm font-bold border rounded bg-gray-50 focus:ring-2 focus:ring-black outline-none"
            />
          </div>
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 -mr-2 text-gray-400 hover:text-black transition-colors"
        >
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>

      {/* DETALHES EXPANDÍVEIS */}
      {isExpanded && (
        <div className="bg-gray-50 px-4 py-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-1">
          <AttributeRow 
            label="Físico" 
            desc="Velocidade e Resistência"
            icon={<Activity size={16} className="text-orange-600"/>} 
            value={stats.fisico} 
            onChange={(v: number) => handleAttributeChange('fisico', v)} 
          />
          <AttributeRow 
            label="Habilidade" 
            desc="Chute, Passe, Drible"
            icon={<Zap size={16} className="text-yellow-600"/>} 
            value={stats.habilidade} 
            onChange={(v: number) => handleAttributeChange('habilidade', v)} 
          />
          <AttributeRow 
            label="Defesa" 
            desc="Roubo, Bloqueio, Marcação"
            icon={<Shield size={16} className="text-blue-600"/>} 
            value={stats.defesa} 
            onChange={(v: number) => handleAttributeChange('defesa', v)} 
          />
        </div>
      )}
    </div>
  );
}

const AttributeRow = ({ label, desc, icon, value, onChange }: any) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-700">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <span className="text-[10px] text-gray-400 italic">{desc}</span>
    </div>
    
    <div className="flex items-center gap-3">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-500"
      />
      <input 
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-12 h-8 text-center text-xs font-medium border rounded bg-white focus:border-black outline-none"
      />
    </div>
  </div>
);
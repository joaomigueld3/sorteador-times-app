"use client";
import { useState } from "react";
import { MOCK_PLAYERS, Player } from "../data/mocks";
import { Lock, User, CheckCircle2 } from "lucide-react";

interface LoginModalProps {
  onLogin: (player: Player) => void;
}

export default function LoginModal({ onLogin }: LoginModalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const player = MOCK_PLAYERS.find(p => p.id === selectedPlayerId);
    if (!player) return;

    if (player.pin === pin) {
      onLogin(player);
    } else {
      setError("PIN incorreto. Tente '1234' (mock).");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-900/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-800 w-full max-w-sm rounded-2xl border border-dark-700 shadow-2xl overflow-hidden">
        {/* Header do Modal */}
        <div className="bg-neon-400 p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-black/20 rounded-full flex items-center justify-center mb-3">
            <User className="text-dark-900 w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-dark-900 uppercase tracking-tighter">Quem é você?</h2>
          <p className="text-dark-800/80 text-xs font-medium">Identifique-se para votar na rodada</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Select Jogador */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 ml-1">Selecione seu nome</label>
            <select
              value={selectedPlayerId}
              onChange={(e) => { setSelectedPlayerId(e.target.value); setError(""); }}
              className="w-full bg-dark-900 border border-dark-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-neon-400 focus:border-transparent outline-none appearance-none"
            >
              <option value="">-- Selecione --</option>
              {MOCK_PLAYERS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Input PIN */}
          <div className={`space-y-1 transition-all ${selectedPlayerId ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <label className="text-xs text-gray-400 ml-1">Seu PIN (Senha)</label>
            <div className="relative">
              <input
                type="password"
                maxLength={4}
                placeholder="****"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-neon-400 focus:border-transparent outline-none tracking-widest text-center font-mono"
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs text-center font-medium animate-pulse">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={!selectedPlayerId || pin.length < 4}
            className="w-full bg-neon-400 text-dark-900 font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neon-500 transition-colors flex items-center justify-center gap-2"
          >
            Entrar e Votar <CheckCircle2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
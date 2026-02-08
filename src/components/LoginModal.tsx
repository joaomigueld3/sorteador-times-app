"use client";
import { useState } from "react";
import { MOCK_PLAYERS, Player } from "../data/mocks";
import { Lock, User, CheckCircle2, Sun, Moon } from "lucide-react";

interface LoginModalProps {
  onLogin: (player: Player) => void;
  toggleTheme: () => void;
  currentTheme: 'light' | 'dark';
}

export default function LoginModal({ onLogin, toggleTheme, currentTheme }: LoginModalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const player = MOCK_PLAYERS.find(p => p.id === selectedPlayerId);
    if (!player) return;

    if (player.pin === pin) {
      onLogin(player);
    } else {
      setError("PIN incorreto (Use 1234)");
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative"
           style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderWidth: '1px' }}>
        
        {/* Botão de Tema no Login */}
        <button 
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors z-10"
          style={{ color: 'var(--text-primary)' }}
        >
          {currentTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Header do Modal */}
        <div className="p-6 text-center relative" style={{ backgroundColor: 'var(--bg-header)' }}>
          <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <User className="text-white w-6 h-6" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-white">
            Perronhas<span style={{ color: 'var(--accent)' }}>Rebirth</span>
          </h2>
          <p className="text-white/80 text-xs font-medium">Quem vai dar nota hoje?</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs ml-1 opacity-70" style={{ color: 'var(--text-secondary)' }}>Selecione seu nome</label>
            <select
              value={selectedPlayerId}
              onChange={(e) => { setSelectedPlayerId(e.target.value); setError(""); }}
              className="w-full p-3 rounded-xl border outline-none appearance-none font-bold"
              style={{ 
                backgroundColor: 'var(--bg-page)', 
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="">-- Selecione --</option>
              {MOCK_PLAYERS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className={`space-y-1 transition-all ${selectedPlayerId ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <label className="text-xs ml-1 opacity-70" style={{ color: 'var(--text-secondary)' }}>PIN de Acesso</label>
            <div className="relative">
              <input
                type="password"
                maxLength={4}
                placeholder="****"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full p-3 rounded-xl border outline-none tracking-widest text-center font-mono"
                style={{ 
                    backgroundColor: 'var(--bg-page)', 
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4 opacity-50" style={{ color: 'var(--text-secondary)' }} />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs text-center font-medium animate-pulse">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={!selectedPlayerId || pin.length < 4}
            className="w-full font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            Entrar e Votar <CheckCircle2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
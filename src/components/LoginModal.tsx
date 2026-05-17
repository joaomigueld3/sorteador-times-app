"use client";
import { useState } from "react";
import { api, getErrorMessage } from "../services/api"; // Importando a API
import { Lock, User, CheckCircle2, Sun, Moon } from "lucide-react";

interface LoginModalProps {
  players: any[]; // Recebe a lista do Backend
  onLogin: (player: any, matchId: string | null) => void; // Agora retorna também o MatchID
  toggleTheme: () => void;
  currentTheme: 'light' | 'dark';
  backendError?: string;
  offlineMode?: boolean;
  onBack?: () => void;
}

export default function LoginModal({ players, onLogin, toggleTheme, currentTheme, backendError, offlineMode, onBack }: LoginModalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!selectedPlayerId || pin.length < 4) return;
    
    setLoading(true);
    setError("");

    try {
      if (offlineMode) {
        const selected = players.find((p) => (p._id || p.id) === selectedPlayerId);
        if (!selected) {
          setError("Jogador nao encontrado.");
          return;
        }
        if (String(selected.pin || "1234") !== pin) {
          setError("PIN invalido.");
          return;
        }
        onLogin(selected, null);
        return;
      }

      // Chama o Backend para validar
      const response = await api.login(selectedPlayerId, pin);

      if (response.error) {
        setError(response.error);
      } else {
        // Sucesso! Passa o user e a rodada ativa
        onLogin(response.player, response.activeMatchId);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Erro de conexao com o servidor."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative"
           style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderWidth: '1px' }}>
        
        <button 
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors z-10"
          style={{ color: 'var(--text-primary)' }}
        >
          {currentTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

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
          {onBack && (
            <button
              onClick={onBack}
              className="w-full rounded-lg py-2 text-xs font-bold border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Voltar ao inicio
            </button>
          )}
          {backendError && (
            <p className="text-red-300 text-xs text-center font-semibold rounded-lg border px-3 py-2"
              style={{ borderColor: '#fca5a5', backgroundColor: 'rgba(127, 29, 29, 0.35)' }}>
              {backendError}
            </p>
          )}
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
              {/* Agora usa a lista real vinda das props */}
              {players.map(p => (
                <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
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
            disabled={loading || !selectedPlayerId || pin.length < 4}
            className="w-full font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {loading ? "Verificando..." : "Entrar e Votar"} {!loading && <CheckCircle2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

const API_URL = 'http://localhost:4000'; // Ou sua URL do Render/Railway depois

export interface LoginResponse {
  player: any;
  activeMatchId: string | null;
  error?: string;
}

export const api = {
  // 1. Listar todos os jogadores (Para o Dashboard)
  getPlayers: async () => {
    const res = await fetch(`${API_URL}/players`);
    return res.json();
  },

  // 2. Fazer Login
  login: async (playerId: string, pin: string): Promise<LoginResponse> => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, pin }),
    });
    return res.json();
  },

  // 3. Enviar Voto (Tempo Real)
  submitVote: async (voterId: string, matchId: string, votes: any) => {
    const res = await fetch(`${API_URL}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId, matchId, votes }),
    });
    return res.json();
  }
};
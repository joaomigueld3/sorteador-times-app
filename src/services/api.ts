const API_URL = 'http://localhost:4000'; // Ou sua URL do Render/Railway depois

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface LoginResponse {
  player: any;
  activeMatchId: string | null;
  error?: string;
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let res: Response;

  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError("Nao foi possivel conectar ao servidor. Verifique se o backend esta rodando.");
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data && typeof (data as { error?: string }).error === "string"
        ? (data as { error: string }).error
        : `Erro no servidor (${res.status}).`;
    throw new ApiError(message, res.status);
  }

  return data as T;
};

export const getErrorMessage = (error: unknown, fallback = "Ocorreu um erro inesperado.") => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const api = {
  // 1. Listar todos os jogadores (Para o Dashboard)
  getPlayers: async () => {
    return request<any[]>("/players");
  },

  // 2. Fazer Login
  login: async (playerId: string, pin: string): Promise<LoginResponse> => {
    return request<LoginResponse>("/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, pin }),
    });
  },

  // 3. Enviar Voto (Tempo Real)
  submitVote: async (voterId: string, matchId: string, votes: any) => {
    return request<{ success?: boolean; error?: string }>("/votes", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId, matchId, votes }),
    });
  }
};

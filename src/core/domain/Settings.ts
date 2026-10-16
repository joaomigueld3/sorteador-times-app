export interface Settings {
  weights: {
    fisico: number;
    habilidade: number;
    defesa: number;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  weights: {
    fisico: 40,
    habilidade: 30,
    defesa: 30,
  },
};

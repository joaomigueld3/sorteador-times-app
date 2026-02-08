// src/data/mocks.ts

export type Position = 'ATA' | 'ZAG' | 'MEI' | 'GOL';

export interface PlayerAttributes {
  fisico: number;
  habilidade: number;
  defesa: number;
}

export interface Player {
  id: string;
  name: string;
  positions: Position[];
  currentStats: PlayerAttributes;
  pin: string; // PIN secreto para votar (Simulação)
}

// Helper para calcular nota com PESOS: F(40), H(35), D(25)
export const calculateOverall = (stats: PlayerAttributes) => {
  return Math.round(
    (stats.fisico * 0.4) + 
    (stats.habilidade * 0.35) + 
    (stats.defesa * 0.25)
  );
};

export const MOCK_PLAYERS: Player[] = [
  { id: '1', name: 'Jorginho Eng.', positions: ['MEI', 'ATA'], currentStats: { fisico: 80, habilidade: 75, defesa: 60 }, pin: '1234' },
  { id: '2', name: 'Lucas Dev', positions: ['ATA'], currentStats: { fisico: 90, habilidade: 85, defesa: 40 }, pin: '1234' },
  { id: '3', name: 'Matheus Paredão', positions: ['ZAG'], currentStats: { fisico: 70, habilidade: 50, defesa: 88 }, pin: '1234' },
  { id: '4', name: 'André Veloz', positions: ['ATA'], currentStats: { fisico: 95, habilidade: 70, defesa: 30 }, pin: '1234' },
  { id: '5', name: 'Brunão Volante', positions: ['ZAG', 'MEI'], currentStats: { fisico: 85, habilidade: 65, defesa: 80 }, pin: '1234' },
  { id: '6', name: 'Pedrinho Liso', positions: ['ATA'], currentStats: { fisico: 60, habilidade: 92, defesa: 20 }, pin: '1234' },
  { id: '7', name: 'Ciro Goleiro', positions: ['GOL'], currentStats: { fisico: 50, habilidade: 40, defesa: 95 }, pin: '1234' },
  { id: '8', name: 'Renato Veterano', positions: ['MEI'], currentStats: { fisico: 40, habilidade: 88, defesa: 50 }, pin: '1234' },
  { id: '9', name: 'Felipe Lateral', positions: ['ZAG', 'ATA'], currentStats: { fisico: 88, habilidade: 60, defesa: 70 }, pin: '1234' },
  { id: '10', name: 'Davi Canhoto', positions: ['MEI'], currentStats: { fisico: 75, habilidade: 80, defesa: 55 }, pin: '1234' },
];
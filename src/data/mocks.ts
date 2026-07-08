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
  { id: '1', name: 'Must (I. Fellows)', positions: ['ATA'], currentStats: { fisico: 80, habilidade: 100, defesa: 70 }, pin: '1234' },
  { id: '2', name: 'Sundown', positions: ['ATA', 'ZAG'], currentStats: { fisico: 100, habilidade: 100, defesa: 80 }, pin: '1234' },
  { id: '3', name: 'Pernambuco', positions: ['ATA'], currentStats: { fisico: 100, habilidade: 100, defesa: 80 }, pin: '1234' },
  { id: '4', name: 'Cheldon', positions: ['ATA', 'ZAG'], currentStats: { fisico: 90, habilidade: 90, defesa: 100 }, pin: '1234' },
  { id: '5', name: 'Lucas Guedes', positions: ['ATA', 'ZAG'], currentStats: { fisico: 100, habilidade: 100, defesa: 80 }, pin: '1234' },
  { id: '6', name: 'Sales', positions: ['ATA', 'ZAG'], currentStats: { fisico: 80, habilidade: 90, defesa: 80 }, pin: '1234' },
  { id: '7', name: 'Rafael Coelho', positions: ['ATA'], currentStats: { fisico: 80, habilidade: 80, defesa: 70 }, pin: '1234' },
  { id: '8', name: 'Ighor Honorato', positions: ['ATA', 'ZAG'], currentStats: { fisico: 70, habilidade: 100, defesa: 80 }, pin: '1234' },
  { id: '9', name: 'Caio Almeida', positions: ['ATA', 'ZAG'], currentStats: { fisico: 90, habilidade: 80, defesa: 90 }, pin: '1234' },
  { id: '10', name: 'Emanuel', positions: ['ATA', 'ZAG'], currentStats: { fisico: 90, habilidade: 70, defesa: 80 }, pin: '1234' },
  { id: '11', name: 'Heverton', positions: ['ATA', 'ZAG'], currentStats: { fisico: 70, habilidade: 70, defesa: 80 }, pin: '1234' },
  { id: '12', name: 'Rennar', positions: ['ZAG'], currentStats: { fisico: 70, habilidade: 80, defesa: 80 }, pin: '1234' },
  { id: '13', name: 'Diogo', positions: ['ATA'], currentStats: { fisico: 90, habilidade: 60, defesa: 70 }, pin: '1234' },
  { id: '14', name: 'Juninho', positions: ['ATA'], currentStats: { fisico: 70, habilidade: 80, defesa: 70 }, pin: '1234' },
  { id: '15', name: 'Silas', positions: ['ZAG'], currentStats: { fisico: 70, habilidade: 70, defesa: 70 }, pin: '1234' },
  { id: '16', name: 'Miguel Guerra', positions: ['ZAG'], currentStats: { fisico: 70, habilidade: 60, defesa: 90 }, pin: '1234' },
  { id: '17', name: 'Petros', positions: ['ZAG'], currentStats: { fisico: 60, habilidade: 60, defesa: 100 }, pin: '1234' },
  { id: '18', name: 'Luquinhas', positions: ['ATA'], currentStats: { fisico: 70, habilidade: 70, defesa: 50 }, pin: '1234' },
  { id: '19', name: 'Joao Miguel', positions: ['ATA'], currentStats: { fisico: 60, habilidade: 60, defesa: 60 }, pin: '1234' },
  { id: '20', name: 'Jeff Pai', positions: ['ZAG'], currentStats: { fisico: 60, habilidade: 70, defesa: 60 }, pin: '1234' },
  { id: '21', name: 'Victor Hugo', positions: ['ATA'], currentStats: { fisico: 60, habilidade: 80, defesa: 60 }, pin: '1234' },
  { id: '22', name: 'Mateus Souza', positions: ['ZAG'], currentStats: { fisico: 50, habilidade: 50, defesa: 50 }, pin: '1234' },
  { id: '23', name: 'Luciano', positions: ['ZAG'], currentStats: { fisico: 70, habilidade: 80, defesa: 70 }, pin: '1234' },
  { id: '24', name: 'Deodato', positions: ['ATA', 'ZAG'], currentStats: { fisico: 70, habilidade: 60, defesa: 70 }, pin: '1234' },
  { id: '25', name: 'Raffa Tangamandapio', positions: ['ATA', 'ZAG'], currentStats: { fisico: 60, habilidade: 70, defesa: 60 }, pin: '1234' },


];
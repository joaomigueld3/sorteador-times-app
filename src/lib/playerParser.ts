import { PlayerType, Position } from "./types";

export interface ParsedPlayerRow {
  name: string;
  positions: Position[];
  currentStats: {
    fisico: number;
    habilidade: number;
    defesa: number;
  };
  type: PlayerType;
}

export const toTensScale = (value: number): number => {
  const normalizedBase = value <= 10 ? value * 10 : value;
  const rounded = Math.round(normalizedBase);
  if (rounded < 10) return 10;
  if (rounded > 100) return 100;
  return rounded;
};

const normName = (s: string) => s.trim().toLocaleLowerCase("pt-BR");

export function parsePlayerLines(
  text: string,
  defaultType: PlayerType = "mensalista"
): ParsedPlayerRow[] {
  const parsed: ParsedPlayerRow[] = [];

  text.split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;

    const parts = line.split(/[;,]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) return;

    const playerName = parts[0];
    if (parsed.some((p) => normName(p.name) === normName(playerName))) return;

    let nf = Number(parts[1]);
    let nh = Number(parts[1]);
    let nd = Number(parts[1]);
    let remainingTokens = parts.slice(2);

    if (parts.length >= 4 && !Number.isNaN(Number(parts[2])) && !Number.isNaN(Number(parts[3]))) {
      nf = Number(parts[1]);
      nh = Number(parts[2]);
      nd = Number(parts[3]);
      remainingTokens = parts.slice(4);
    }

    if ([nf, nh, nd].some((v) => Number.isNaN(v))) return;

    const positions: Position[] = [];
    let detectedType: PlayerType = defaultType;

    for (const token of remainingTokens) {
      const upper = token.toUpperCase();
      if (upper.includes("ATA") && !positions.includes("ATA")) {
        positions.push("ATA");
      }
      if (upper.includes("ZAG") && !positions.includes("ZAG")) {
        positions.push("ZAG");
      }
      if (upper.includes("DIARISTA") || upper.includes("DIA")) {
        detectedType = "diarista";
      } else if (upper.includes("MENSALISTA") || upper.includes("MEN")) {
        detectedType = "mensalista";
      }
    }

    // Se nenhuma posição for informada, definir ATA por padrão
    if (positions.length === 0) {
      positions.push("ATA");
    }

    parsed.push({
      name: playerName,
      positions,
      currentStats: {
        fisico: toTensScale(nf),
        habilidade: toTensScale(nh),
        defesa: toTensScale(nd),
      },
      type: detectedType,
    });
  });

  return parsed;
}

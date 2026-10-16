import { describe, it, expect } from "vitest";
import { computeAverages } from "../VoteAverages";

describe("computeAverages", () => {
  it("retorna objeto vazio quando nao ha votos", () => {
    expect(computeAverages([])).toEqual({});
  });

  it("calcula a media arredondada de cada atributo por jogador", () => {
    const result = computeAverages([
      { p1: { fisico: 50, habilidade: 60, defesa: 70 } },
      { p1: { fisico: 60, habilidade: 70, defesa: 80 } },
      { p1: { fisico: 60, habilidade: 70, defesa: 80 } },
    ]);

    // 170/3 = 56.67 -> 57 ; 200/3 = 66.67 -> 67 ; 230/3 = 76.67 -> 77
    expect(result).toEqual({ p1: { fisico: 57, habilidade: 67, defesa: 77 } });
  });

  it("divide cada jogador apenas pelos votos que o avaliaram", () => {
    const result = computeAverages([
      { p1: { fisico: 40, habilidade: 40, defesa: 40 }, p2: { fisico: 100, habilidade: 100, defesa: 100 } },
      { p1: { fisico: 60, habilidade: 60, defesa: 60 } },
    ]);

    expect(result).toEqual({
      p1: { fisico: 50, habilidade: 50, defesa: 50 },
      p2: { fisico: 100, habilidade: 100, defesa: 100 },
    });
  });
});

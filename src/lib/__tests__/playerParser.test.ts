import { describe, it, expect } from "vitest";
import { parsePlayerLines, toTensScale } from "../playerParser";

describe("playerParser", () => {
  describe("toTensScale", () => {
    it("should normalize <= 10 to tens scale", () => {
      expect(toTensScale(7)).toBe(70);
      expect(toTensScale(9.5)).toBe(95);
      expect(toTensScale(0)).toBe(10); // minimum is 10
    });

    it("should clamp values between 10 and 100", () => {
      expect(toTensScale(105)).toBe(100);
      expect(toTensScale(50)).toBe(50);
      expect(toTensScale(85)).toBe(85);
    });
  });

  describe("parsePlayerLines", () => {
    it("should parse simple line with single note and position", () => {
      const input = "Neymar, 90, ATA";
      const result = parsePlayerLines(input, "mensalista");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "Neymar",
        positions: ["ATA"],
        currentStats: { fisico: 90, habilidade: 90, defesa: 90 },
        type: "mensalista",
      });
    });

    it("should parse detailed line with 3 attributes and multiple positions", () => {
      const input = "Casemiro, 85, 75, 90, ATA+ZAG";
      const result = parsePlayerLines(input, "mensalista");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "Casemiro",
        positions: ["ATA", "ZAG"],
        currentStats: { fisico: 85, habilidade: 75, defesa: 90 },
        type: "mensalista",
      });
    });

    it("should detect diarista in the line tokens regardless of defaultType", () => {
      const input = "Convidado Especial, 70, 70, 70, ATA, diarista";
      const result = parsePlayerLines(input, "mensalista");

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("diarista");
    });

    it("should respect defaultType when not specified in line", () => {
      const input = "Joaozinho, 60, ZAG";
      const result = parsePlayerLines(input, "diarista");

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("diarista");
    });

    it("should ignore duplicate names in batch input", () => {
      const input = `
        Lucas, 80, ATA
        lucas, 85, ZAG
        Pedro, 75, ATA
      `;
      const result = parsePlayerLines(input, "mensalista");

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Lucas");
      expect(result[1].name).toBe("Pedro");
    });
  });
});

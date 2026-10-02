import { describe, it, expect } from "vitest";
import { CreateRoundUseCase } from "../CreateRoundUseCase";
import { IRoundRepository } from "../../ports/IRoundRepository";
import { Round } from "../../domain/Round";

class MockRoundRepository implements IRoundRepository {
  async findById(): Promise<Round | null> { return null; }
  async create(): Promise<string> { return "mock_id"; }
  async addVoter(): Promise<boolean> { return true; }
  async findAll(): Promise<Round[]> { return []; }
}

describe("CreateRoundUseCase", () => {
  it("deve criar uma rodada com sucesso quando os dados sao validos", async () => {
    const repo = new MockRoundRepository();
    const useCase = new CreateRoundUseCase(repo);

    const result = await useCase.execute({
      playerIds: ["p1"],
      adminNotes: { p1: { fisico: 50, habilidade: 50, defesa: 50 } }
    });

    expect(result).toBe("mock_id");
  });

  it("deve lancar erro se nao houver jogadores", async () => {
    const repo = new MockRoundRepository();
    const useCase = new CreateRoundUseCase(repo);

    await expect(useCase.execute({ playerIds: [], adminNotes: {} })).rejects.toThrow("Pelo menos 1 jogador deve ser selecionado");
  });
});

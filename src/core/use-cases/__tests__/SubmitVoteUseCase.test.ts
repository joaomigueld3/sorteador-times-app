import { describe, it, expect } from "vitest";
import { SubmitVoteUseCase } from "../SubmitVoteUseCase";
import { IRoundRepository } from "../../ports/IRoundRepository";
import { IVoteRepository } from "../../ports/IVoteRepository";
import { Round } from "../../domain/Round";

class MockRoundRepository implements IRoundRepository {
  async findById(): Promise<Round | null> { return null; }
  async create(): Promise<string> { return "mock_id"; }
  async addVoter(roundId: string): Promise<boolean> { return roundId === "valid_round"; }
  async findAll(): Promise<Round[]> { return []; }
}

class MockVoteRepository implements IVoteRepository {
  async create(): Promise<string> { return "vote_id"; }
}

describe("SubmitVoteUseCase", () => {
  it("deve registrar o voto com sucesso", async () => {
    const roundRepo = new MockRoundRepository();
    const voteRepo = new MockVoteRepository();
    const useCase = new SubmitVoteUseCase(roundRepo, voteRepo);

    await expect(useCase.execute({
      roundId: "valid_round",
      email: "test@test.com",
      ratings: {
        p1: { fisico: 40, habilidade: 50, defesa: 60 }
      }
    })).resolves.toBeUndefined();
  });

  it("deve barrar voto com notas quebradas (nao multiplos de 10)", async () => {
    const roundRepo = new MockRoundRepository();
    const voteRepo = new MockVoteRepository();
    const useCase = new SubmitVoteUseCase(roundRepo, voteRepo);

    await expect(useCase.execute({
      roundId: "valid_round",
      email: "test@test.com",
      ratings: {
        p1: { fisico: 45, habilidade: 50, defesa: 60 }
      }
    })).rejects.toThrow("Notas devem ser multiplos de 10");
  });

  it("deve falhar se a rodada for invalida ou ja votou", async () => {
    const roundRepo = new MockRoundRepository();
    const voteRepo = new MockVoteRepository();
    const useCase = new SubmitVoteUseCase(roundRepo, voteRepo);

    await expect(useCase.execute({
      roundId: "invalid_round",
      email: "test@test.com",
      ratings: {
        p1: { fisico: 40, habilidade: 50, defesa: 60 }
      }
    })).rejects.toThrow("Voce ja votou nesta rodada");
  });
});

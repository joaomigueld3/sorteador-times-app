import { describe, it, expect } from "vitest";
import { SubmitVoteUseCase } from "../SubmitVoteUseCase";
import { IRoundRepository } from "../../ports/IRoundRepository";
import { IVoteRepository } from "../../ports/IVoteRepository";
import { IPlayerRepository } from "../../ports/IPlayerRepository";
import { Round } from "../../domain/Round";
import { Player } from "../../domain/Player";
import { InvalidNoteError, VoteRejectedError, VotingNotAllowedError } from "../../domain/errors";

class MockRoundRepository implements IRoundRepository {
  addVoterCalls = 0;
  async findById(): Promise<Round | null> { return null; }
  async create(): Promise<string> { return "mock_id"; }
  async addVoter(roundId: string): Promise<boolean> {
    this.addVoterCalls += 1;
    return roundId === "valid_round";
  }
  async findAll(): Promise<Round[]> { return []; }
}

class MockVoteRepository implements IVoteRepository {
  async create(): Promise<string> { return "vote_id"; }
}

class MockPlayerRepository implements IPlayerRepository {
  constructor(private players: Record<string, Player> = {}) {}
  async findByEmail(email: string): Promise<Player | null> { return this.players[email] ?? null; }
}

function makeUseCase(players: Record<string, Player> = {}) {
  const roundRepo = new MockRoundRepository();
  const useCase = new SubmitVoteUseCase(roundRepo, new MockVoteRepository(), new MockPlayerRepository(players));
  return { useCase, roundRepo };
}

describe("SubmitVoteUseCase", () => {
  it("deve registrar o voto com sucesso", async () => {
    const { useCase } = makeUseCase();

    await expect(useCase.execute({
      roundId: "valid_round",
      email: "test@test.com",
      ratings: {
        p1: { fisico: 40, habilidade: 50, defesa: 60 }
      }
    })).resolves.toBeUndefined();
  });

  it("deve barrar voto com notas quebradas (nao multiplos de 10)", async () => {
    const { useCase } = makeUseCase();

    const promise = useCase.execute({
      roundId: "valid_round",
      email: "test@test.com",
      ratings: {
        p1: { fisico: 45, habilidade: 50, defesa: 60 }
      }
    });
    await expect(promise).rejects.toThrow("Notas devem ser multiplos de 10");
    await expect(promise).rejects.toBeInstanceOf(InvalidNoteError);
  });

  it("deve falhar se a rodada for invalida ou ja votou", async () => {
    const { useCase } = makeUseCase();

    const promise = useCase.execute({
      roundId: "invalid_round",
      email: "test@test.com",
      ratings: {
        p1: { fisico: 40, habilidade: 50, defesa: 60 }
      }
    });
    await expect(promise).rejects.toThrow("Voce ja votou nesta rodada");
    await expect(promise).rejects.toBeInstanceOf(VoteRejectedError);
  });

  it("deve barrar diarista sem registrar o voto na rodada", async () => {
    const { useCase, roundRepo } = makeUseCase({
      "diarista@test.com": { id: "p9", name: "Diarista", type: "diarista" },
    });

    await expect(useCase.execute({
      roundId: "valid_round",
      email: "diarista@test.com",
      ratings: {
        p1: { fisico: 40, habilidade: 50, defesa: 60 }
      }
    })).rejects.toBeInstanceOf(VotingNotAllowedError);
    expect(roundRepo.addVoterCalls).toBe(0);
  });

  it("deve permitir mensalista vinculado votar", async () => {
    const { useCase } = makeUseCase({
      "mensalista@test.com": { id: "p1", name: "Mensalista", type: "mensalista" },
    });

    await expect(useCase.execute({
      roundId: "valid_round",
      email: "mensalista@test.com",
      ratings: {
        p1: { fisico: 40, habilidade: 50, defesa: 60 }
      }
    })).resolves.toBeUndefined();
  });
});

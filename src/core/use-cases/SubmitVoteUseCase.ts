import { IRoundRepository } from "../ports/IRoundRepository";
import { IVoteRepository } from "../ports/IVoteRepository";
import { IPlayerRepository } from "../ports/IPlayerRepository";
import { PlayerAttributes } from "../domain/Round";
import { hasValidNotes } from "../domain/Rating";
import { canVoteInRounds } from "../domain/Player";
import { InvalidNoteError, VoteRejectedError, VotingNotAllowedError } from "../domain/errors";

interface SubmitVoteDTO {
  roundId: string;
  email: string;
  name?: string;
  ratings: Record<string, PlayerAttributes>;
}

export class SubmitVoteUseCase {
  constructor(
    private roundRepo: IRoundRepository,
    private voteRepo: IVoteRepository,
    private playerRepo: IPlayerRepository
  ) {}

  async execute(data: SubmitVoteDTO): Promise<void> {
    // 1. Quem vota: email sem jogador vinculado pode votar; diarista vinculado nao pode
    const voter = await this.playerRepo.findByEmail(data.email);
    if (voter && !canVoteInRounds(voter)) {
      throw new VotingNotAllowedError();
    }

    // 2. Validação de domínio (múltiplos de 10)
    if (!Object.values(data.ratings).every(hasValidNotes)) {
      throw new InvalidNoteError();
    }

    // 3. Atualiza a rodada garantindo que o email nao votou antes (atomicamente)
    const success = await this.roundRepo.addVoter(data.roundId, data.email, data.name);
    if (!success) {
      throw new VoteRejectedError();
    }

    // 4. Salva os votos de forma anonima (sem o email)
    await this.voteRepo.create({
      roundId: data.roundId,
      ratings: data.ratings,
      submittedAt: new Date(),
    });
  }
}

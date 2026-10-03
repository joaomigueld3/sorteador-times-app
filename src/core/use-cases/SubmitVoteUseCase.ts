import { IRoundRepository } from "../ports/IRoundRepository";
import { IVoteRepository } from "../ports/IVoteRepository";
import { PlayerAttributes } from "../domain/Round";
import { isValidNote } from "../../lib/types";

interface SubmitVoteDTO {
  roundId: string;
  email: string;
  name?: string;
  ratings: Record<string, PlayerAttributes>;
}

export class SubmitVoteUseCase {
  constructor(
    private roundRepo: IRoundRepository,
    private voteRepo: IVoteRepository
  ) {}

  async execute(data: SubmitVoteDTO): Promise<void> {
    // 1. Validação de domínio (múltiplos de 10)
    for (const attrs of Object.values(data.ratings)) {
      if (!isValidNote(attrs.fisico) || !isValidNote(attrs.habilidade) || !isValidNote(attrs.defesa)) {
        throw new Error("Notas devem ser multiplos de 10 (0, 10, 20, ..., 100).");
      }
    }

    // 2. Atualiza a rodada garantindo que o email nao votou antes (atomicamente)
    const success = await this.roundRepo.addVoter(data.roundId, data.email, data.name);
    if (!success) {
      throw new Error("Voce ja votou nesta rodada, ou a rodada nao esta aberta/nao existe.");
    }

    // 3. Salva os votos de forma anonima (sem o email)
    await this.voteRepo.create({
      roundId: data.roundId,
      ratings: data.ratings,
      submittedAt: new Date(),
    });
  }
}

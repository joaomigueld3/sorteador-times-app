import { IRoundRepository } from "../ports/IRoundRepository";
import { PlayerAttributes } from "../domain/Round";

interface CreateRoundDTO {
  playerIds: string[];
  adminNotes: Record<string, PlayerAttributes>;
}

export class CreateRoundUseCase {
  constructor(private roundRepo: IRoundRepository) {}

  async execute(data: CreateRoundDTO): Promise<string> {
    if (!data.playerIds || data.playerIds.length === 0) {
      throw new Error("Pelo menos 1 jogador deve ser selecionado.");
    }
    if (!data.adminNotes || Object.keys(data.adminNotes).length === 0) {
      throw new Error("Notas de referencia sao obrigatorias.");
    }

    const roundId = await this.roundRepo.create(data);
    return roundId;
  }
}

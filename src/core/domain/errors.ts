/** Base para violações de regras de negócio. Adapters (ex.: rotas HTTP) traduzem cada subclasse para o seu protocolo. */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidNoteError extends DomainError {
  constructor() {
    super("Notas devem ser multiplos de 10 (0, 10, 20, ..., 100).");
  }
}

/** A rodada não aceita este voto: ela não existe, não está aberta, ou o email já votou. */
export class VoteRejectedError extends DomainError {
  constructor() {
    super("Voce ja votou nesta rodada, ou a rodada nao esta aberta/nao existe.");
  }
}

export class VotingNotAllowedError extends DomainError {
  constructor() {
    super("Jogadores diaristas não têm permissão para votar na rodada.");
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { SubmitVoteUseCase } from "@/core/use-cases/SubmitVoteUseCase";
import { MongoRoundRepository } from "@/core/infrastructure/MongoRoundRepository";
import { MongoVoteRepository } from "@/core/infrastructure/MongoVoteRepository";
import { MongoPlayerRepository } from "@/core/infrastructure/MongoPlayerRepository";
import { VoteRejectedError, VotingNotAllowedError } from "@/core/domain/errors";

const submitVoteSchema = z.object({
  roundId: z.string().min(1),
  ratings: z.record(
    z.string(),
    z.object({
      fisico: z.number(),
      habilidade: z.number(),
      defesa: z.number(),
    })
  ),
});

function statusFor(error: unknown): number {
  if (error instanceof VotingNotAllowedError) return 403;
  if (error instanceof VoteRejectedError) return 409;
  return 400; // InvalidNoteError e erros não mapeados mantêm o 400 que a rota já retornava
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Faca login com Google primeiro." }, { status: 401 });
    }

    const body = await req.json();
    const result = submitVoteSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
    }

    const useCase = new SubmitVoteUseCase(
      new MongoRoundRepository(),
      new MongoVoteRepository(),
      new MongoPlayerRepository()
    );

    await useCase.execute({
      roundId: result.data.roundId,
      email: session.user.email,
      name: session.user.name || undefined,
      ratings: result.data.ratings,
    });

    return NextResponse.json({ success: true, message: "Voto registrado com sucesso!" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: statusFor(error) });
  }
}

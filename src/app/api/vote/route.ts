import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { SubmitVoteUseCase } from "@/core/use-cases/SubmitVoteUseCase";
import { MongoRoundRepository } from "@/core/infrastructure/MongoRoundRepository";
import { MongoVoteRepository } from "@/core/infrastructure/MongoVoteRepository";

import { getDb } from "@/lib/mongodb";

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

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Faca login com Google primeiro." }, { status: 401 });
    }

    const db = await getDb();
    const voterPlayer = await db.collection("players").findOne({ googleEmail: session.user.email });
    if (voterPlayer && voterPlayer.type === "diarista") {
      return NextResponse.json(
        { error: "Jogadores diaristas não têm permissão para votar na rodada." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = submitVoteSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
    }

    const roundRepo = new MongoRoundRepository();
    const voteRepo = new MongoVoteRepository();
    const useCase = new SubmitVoteUseCase(roundRepo, voteRepo);

    await useCase.execute({
      roundId: result.data.roundId,
      email: session.user.email,
      name: session.user.name || undefined,
      ratings: result.data.ratings,
    });

    return NextResponse.json({ success: true, message: "Voto registrado com sucesso!" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    const status = msg.includes("já votou") || msg.includes("nao esta aberta") ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

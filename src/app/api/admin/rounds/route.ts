import { NextRequest, NextResponse } from "next/server";
import { validateAdmin } from "@/lib/admin";
import { z } from "zod";
import { CreateRoundUseCase } from "@/core/use-cases/CreateRoundUseCase";
import { MongoRoundRepository } from "@/core/infrastructure/MongoRoundRepository";

const createRoundSchema = z.object({
  playerIds: z.array(z.string()).min(1, "Selecione pelo menos 1 jogador"),
  adminNotes: z.record(
    z.string(),
    z.object({
      fisico: z.number(),
      habilidade: z.number(),
      defesa: z.number(),
    })
  ),
});

export async function GET(req: NextRequest) {
  const err = validateAdmin(req);
  if (err) return err;

  try {
    const roundRepo = new MongoRoundRepository();
    const rounds = await roundRepo.findAll();
    return NextResponse.json(rounds);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const err = validateAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    const result = createRoundSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Payload invalido" }, { status: 400 });
    }

    const roundRepo = new MongoRoundRepository();
    const useCase = new CreateRoundUseCase(roundRepo);
    
    const roundId = await useCase.execute(result.data);

    return NextResponse.json({ _id: roundId, status: "open" }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao criar rodada.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

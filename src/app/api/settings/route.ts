import { NextRequest, NextResponse } from "next/server";
import { validateAdmin } from "@/lib/admin";
import { z } from "zod";
import { GetSettingsUseCase } from "@/core/use-cases/GetSettingsUseCase";
import { UpdateSettingsUseCase } from "@/core/use-cases/UpdateSettingsUseCase";
import { MongoSettingsRepository } from "@/core/infrastructure/MongoSettingsRepository";

const updateSettingsSchema = z.object({
  weights: z.object({
    fisico: z.number().min(0).max(100),
    habilidade: z.number().min(0).max(100),
    defesa: z.number().min(0).max(100),
  }),
});

// GET publico para carregar pesos padroes no Sorteador
export async function GET() {
  try {
    const repo = new MongoSettingsRepository();
    const useCase = new GetSettingsUseCase(repo);
    const settings = await useCase.execute();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar configuracoes" }, { status: 500 });
  }
}

// POST protegido para Admin atualizar pesos
export async function POST(req: NextRequest) {
  const err = validateAdmin(req);
  if (err) return err;

  try {
    const body = await req.json();
    const result = updateSettingsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
    }

    const repo = new MongoSettingsRepository();
    const useCase = new UpdateSettingsUseCase(repo);
    await useCase.execute(result.data);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar configuracoes" }, { status: 500 });
  }
}

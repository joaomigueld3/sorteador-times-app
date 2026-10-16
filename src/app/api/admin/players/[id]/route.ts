import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { validateAdmin } from "@/lib/admin";
import { z } from "zod";

const playerUpdateSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
  positions: z.array(z.enum(["ATA", "ZAG"])).min(1, "Ao menos uma posicao deve ser informada."),
  currentStats: z.object({
    fisico: z.number().min(0).max(100),
    habilidade: z.number().min(0).max(100),
    defesa: z.number().min(0).max(100),
  }),
  type: z.enum(["mensalista", "diarista"]).default("mensalista"),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = validateAdmin(req);
  if (err) return err;

  try {
    const { id } = await params;
    const body = await req.json();
    const parseResult = playerUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      const message = parseResult.error.issues[0]?.message || "Payload invalido.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("players").updateOne(
      { _id: new ObjectId(id) },
      { $set: parseResult.data }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Jogador nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar jogador." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = validateAdmin(req);
  if (err) return err;

  try {
    const { id } = await params;
    const db = await getDb();
    const result = await db.collection("players").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Jogador nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao deletar jogador." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { validateAdmin } from "@/lib/admin";
import { z } from "zod";
import { PlayerType, Position } from "@/lib/types";

const playerInputSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
  positions: z.array(z.enum(["ATA", "ZAG"])).min(1, "Ao menos uma posicao deve ser informada."),
  currentStats: z.object({
    fisico: z.number().min(0).max(100),
    habilidade: z.number().min(0).max(100),
    defesa: z.number().min(0).max(100),
  }),
  type: z.enum(["mensalista", "diarista"]).default("mensalista"),
});

const bodySchema = z.union([
  z.object({
    players: z.array(playerInputSchema).min(1, "A lista de jogadores nao pode ser vazia."),
  }),
  z.array(playerInputSchema).min(1, "A lista de jogadores nao pode ser vazia."),
  playerInputSchema,
]);

export async function POST(req: NextRequest) {
  const authError = validateAdmin(req);
  if (authError) return authError;

  try {
    const rawBody = await req.json();
    const parseResult = bodySchema.safeParse(rawBody);

    if (!parseResult.success) {
      const message = parseResult.error.issues[0]?.message || "Payload invalido.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const data = parseResult.data;
    const playerList: Array<{
      name: string;
      positions: Position[];
      currentStats: { fisico: number; habilidade: number; defesa: number };
      type: PlayerType;
    }> = Array.isArray(data)
      ? data
      : "players" in data
        ? data.players
        : [data];

    const db = await getDb();
    const collection = db.collection("players");

    const inserted: string[] = [];
    const skipped: string[] = [];

    for (const p of playerList) {
      const existing = await collection.findOne({
        name: { $regex: new RegExp(`^${p.name.trim()}$`, "i") },
      });

      if (existing) {
        skipped.push(p.name);
        continue;
      }

      const doc = {
        name: p.name.trim(),
        positions: p.positions,
        currentStats: p.currentStats,
        type: p.type || "mensalista",
        googleEmail: null,
        isLinked: false,
        pin: "1234",
        createdAt: new Date(),
      };

      await collection.insertOne(doc);
      inserted.push(p.name);
    }

    if (playerList.length === 1 && skipped.length === 1) {
      return NextResponse.json(
        { error: `Ja existe um jogador com o nome "${skipped[0]}".` },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      insertedCount: inserted.length,
      skippedCount: skipped.length,
      inserted,
      skipped,
    });
  } catch (err) {
    console.error("Player Registration Error:", err);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar jogador(es)." },
      { status: 500 }
    );
  }
}

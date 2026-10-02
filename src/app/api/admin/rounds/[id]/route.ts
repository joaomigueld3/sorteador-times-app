import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { validateAdmin } from "@/lib/admin";
import { PlayerAttributes } from "@/lib/types";

// GET /api/admin/rounds/[id] - Detalhe da rodada + votos
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = validateAdmin(req);
  if (err) return err;

  try {
    const { id } = await params;
    const db = await getDb();
    const round = await db.collection("rounds").findOne({ _id: new ObjectId(id) });
    if (!round) {
      return NextResponse.json({ error: "Rodada nao encontrada." }, { status: 404 });
    }

    const votes = await db
      .collection("votes")
      .find({ roundId: new ObjectId(id) })
      .toArray();

    // Computar medias
    const averages: Record<string, PlayerAttributes & { count: number }> = {};
    for (const vote of votes) {
      for (const [pid, ratings] of Object.entries(vote.ratings as Record<string, PlayerAttributes>)) {
        if (!averages[pid]) {
          averages[pid] = { fisico: 0, habilidade: 0, defesa: 0, count: 0 };
        }
        averages[pid].fisico += ratings.fisico;
        averages[pid].habilidade += ratings.habilidade;
        averages[pid].defesa += ratings.defesa;
        averages[pid].count += 1;
      }
    }

    const computedAverages: Record<string, PlayerAttributes> = {};
    for (const [pid, agg] of Object.entries(averages)) {
      computedAverages[pid] = {
        fisico: Math.round(agg.fisico / agg.count),
        habilidade: Math.round(agg.habilidade / agg.count),
        defesa: Math.round(agg.defesa / agg.count),
      };
    }

    // Buscar nomes dos jogadores
    const playerOids = round.playerIds.map((id: string) => new ObjectId(id));
    const players = await db
      .collection("players")
      .find({ _id: { $in: playerOids } })
      .toArray();

    // Quem votou (nomes)
    const allPlayers = await db.collection("players").find({ googleEmail: { $in: round.votedEmails } }).toArray();
    const voterNames = allPlayers.map((p) => String(p.name || ""));

    return NextResponse.json({
      round,
      votes,
      computedAverages,
      players,
      voterNames,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar rodada." }, { status: 500 });
  }
}

// PATCH /api/admin/rounds/[id] - Fechar ou aplicar notas
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = validateAdmin(req);
  if (err) return err;

  try {
    const { id } = await params;
    const { action, finalNotes } = await req.json();
    const db = await getDb();
    const round = await db.collection("rounds").findOne({ _id: new ObjectId(id) });
    if (!round) {
      return NextResponse.json({ error: "Rodada nao encontrada." }, { status: 404 });
    }

    if (action === "close") {
      await db.collection("rounds").updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "closed", closedAt: new Date() } }
      );
      return NextResponse.json({ success: true, status: "closed" });
    }

    if (action === "apply") {
      if (!finalNotes) {
        return NextResponse.json({ error: "finalNotes obrigatorio para aplicar." }, { status: 400 });
      }

      // Atualizar currentStats de cada jogador
      const bulk = Object.entries(finalNotes as Record<string, PlayerAttributes>).map(
        ([pid, stats]) => ({
          updateOne: {
            filter: { _id: new ObjectId(pid) },
            update: { $set: { currentStats: stats } },
          },
        })
      );

      if (bulk.length > 0) {
        await db.collection("players").bulkWrite(bulk);
      }

      await db.collection("rounds").updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "applied" } }
      );

      return NextResponse.json({ success: true, status: "applied" });
    }

    return NextResponse.json({ error: "action invalida. Use 'close' ou 'apply'." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar rodada." }, { status: 500 });
  }
}

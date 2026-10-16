import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { validateAdmin } from "@/lib/admin";
import { PlayerAttributes } from "@/core/domain/Round";
import { computeAverages } from "@/core/domain/VoteAverages";

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

    const computedAverages = computeAverages(
      votes.map((vote) => vote.ratings as Record<string, PlayerAttributes>)
    );

    // Buscar nomes dos jogadores
    const playerOids = round.playerIds.map((id: string) => new ObjectId(id));
    const players = await db
      .collection("players")
      .find({ _id: { $in: playerOids } })
      .toArray();

    // Quem votou (nomes)
    let voterNames = round.votedNames || [];
    if (voterNames.length === 0 && round.votedEmails.length > 0) {
      const allPlayers = await db.collection("players").find({ googleEmail: { $in: round.votedEmails } }).toArray();
      voterNames = allPlayers.map((p) => String(p.name || ""));
    }

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

    if (action === "open") {
      await db.collection("rounds").updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "open" } }
      );
      return NextResponse.json({ success: true, status: "open" });
    }

    if (action === "apply") {
      let notesToApply = finalNotes;

      // Se finalNotes nao for enviado, computa a media a partir dos votos
      if (!notesToApply) {
        const votes = await db.collection("votes").find({ roundId: new ObjectId(id) }).toArray();
        notesToApply = computeAverages(
          votes.map((vote) => vote.ratings as Record<string, PlayerAttributes>)
        );
      }

      // Atualizar currentStats de cada jogador
      const bulk = Object.entries(notesToApply as Record<string, PlayerAttributes>).map(
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

    return NextResponse.json({ error: "action invalida. Use 'open', 'close' ou 'apply'." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar rodada." }, { status: 500 });
  }
}

// DELETE /api/admin/rounds/[id] - Deletar rodada
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = validateAdmin(req);
  if (err) return err;

  try {
    const { id } = await params;
    const db = await getDb();
    
    // Deleta os votos associados
    await db.collection("votes").deleteMany({ roundId: new ObjectId(id) });
    
    // Deleta a rodada
    const result = await db.collection("rounds").deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Rodada nao encontrada." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao deletar rodada." }, { status: 500 });
  }
}

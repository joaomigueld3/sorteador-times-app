import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

// GET /api/rounds/[id] - Info publica da rodada (para votantes)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const round = await db.collection("rounds").findOne({ _id: new ObjectId(id) });
    if (!round) {
      return NextResponse.json({ error: "Rodada nao encontrada." }, { status: 404 });
    }

    // Buscar jogadores sendo avaliados
    const playerOids = round.playerIds.map((pid: string) => new ObjectId(pid));
    const players = await db
      .collection("players")
      .find({ _id: { $in: playerOids } })
      .project({ name: 1, positions: 1 })
      .toArray();

    // Verificar se o usuario logado ja votou e se e diarista
    const session = await auth();
    const email = session?.user?.email;
    const hasVoted = email ? round.votedEmails.includes(email) : false;
    let isDiarista = false;

    if (email) {
      const linkedPlayer = await db.collection("players").findOne({ googleEmail: email });
      if (linkedPlayer && linkedPlayer.type === "diarista") {
        isDiarista = true;
      }
    }

    return NextResponse.json({
      _id: round._id,
      status: round.status,
      createdAt: round.createdAt,
      adminNotes: round.adminNotes,
      players,
      voteCount: round.voteCount,
      totalPlayers: round.playerIds.length,
      hasVoted,
      isDiarista,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar rodada." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

// GET /api/players - Lista todos os jogadores (público)
export async function GET() {
  try {
    const db = await getDb();
    const players = await db.collection("players").find({}).toArray();
    const formattedPlayers = players.map((p) => ({
      ...p,
      type: p.type || "mensalista",
    }));
    return NextResponse.json(formattedPlayers);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar jogadores." }, { status: 500 });
  }
}

// POST /api/players - Vincular email Google a um jogador
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Faca login com Google primeiro." }, { status: 401 });
    }

    const { playerId } = await req.json();
    if (!playerId) {
      return NextResponse.json({ error: "playerId obrigatorio." }, { status: 400 });
    }

    const db = await getDb();
    const email = session.user.email;

    // Verifica se este email ja esta vinculado a outro jogador
    const existingByEmail = await db.collection("players").findOne({ googleEmail: email });
    if (existingByEmail && existingByEmail._id.toString() !== playerId) {
      return NextResponse.json({ error: "Este email ja esta vinculado a outro jogador." }, { status: 409 });
    }

    // Verifica se o jogador ja tem outro email vinculado
    const { ObjectId } = await import("mongodb");
    const player = await db.collection("players").findOne({ _id: new ObjectId(playerId) });
    if (!player) {
      return NextResponse.json({ error: "Jogador nao encontrado." }, { status: 404 });
    }
    if (player.googleEmail && player.googleEmail !== email) {
      return NextResponse.json({ error: "Este jogador ja esta vinculado a outro email." }, { status: 409 });
    }

    // Vincular
    await db.collection("players").updateOne(
      { _id: new ObjectId(playerId) },
      { $set: { googleEmail: email, isLinked: true } }
    );

    return NextResponse.json({ success: true, playerName: player.name });
  } catch {
    return NextResponse.json({ error: "Erro ao vincular jogador." }, { status: 500 });
  }
}

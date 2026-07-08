import { MongoClient } from "mongodb";

const PLAYERS = [
  { name: "Must (I. Fellows)", positions: ["ATA"], currentStats: { fisico: 90, habilidade: 100, defesa: 70 }, pin: "1234" },
  { name: "Sundown", positions: ["ATA", "ZAG"], currentStats: { fisico: 100, habilidade: 100, defesa: 80 }, pin: "1234" },
  { name: "Pernambuco", positions: ["ATA"], currentStats: { fisico: 100, habilidade: 100, defesa: 80 }, pin: "1234" },
  { name: "Cheldon", positions: ["ATA", "ZAG"], currentStats: { fisico: 90, habilidade: 90, defesa: 100 }, pin: "1234" },
  { name: "Lucas Guedes", positions: ["ATA", "ZAG"], currentStats: { fisico: 100, habilidade: 90, defesa: 70 }, pin: "1234" },
  { name: "Sales", positions: ["ATA", "ZAG"], currentStats: { fisico: 80, habilidade: 90, defesa: 80 }, pin: "1234" },
  { name: "Rafael Coelho", positions: ["ATA"], currentStats: { fisico: 80, habilidade: 80, defesa: 70 }, pin: "1234" },
  { name: "Ighor Honorato", positions: ["ATA", "ZAG"], currentStats: { fisico: 70, habilidade: 100, defesa: 80 }, pin: "1234" },
  { name: "Caio Almeida", positions: ["ZAG"], currentStats: { fisico: 90, habilidade: 80, defesa: 90 }, pin: "1234" },
  { name: "Emanuel", positions: ["ATA", "ZAG"], currentStats: { fisico: 90, habilidade: 70, defesa: 80 }, pin: "1234" },
  { name: "Heverton", positions: ["ZAG"], currentStats: { fisico: 80, habilidade: 80, defesa: 80 }, pin: "1234" },
  { name: "Rennar", positions: ["ZAG"], currentStats: { fisico: 70, habilidade: 80, defesa: 80 }, pin: "1234" },
  { name: "Diogo", positions: ["ATA"], currentStats: { fisico: 90, habilidade: 60, defesa: 70 }, pin: "1234" },
  { name: "Juninho", positions: ["ATA"], currentStats: { fisico: 70, habilidade: 80, defesa: 70 }, pin: "1234" },
  { name: "Silas", positions: ["ZAG"], currentStats: { fisico: 70, habilidade: 70, defesa: 70 }, pin: "1234" },
  { name: "Miguel Guerra", positions: ["ZAG"], currentStats: { fisico: 70, habilidade: 60, defesa: 90 }, pin: "1234" },
  { name: "Petros", positions: ["ZAG"], currentStats: { fisico: 60, habilidade: 60, defesa: 100 }, pin: "1234" },
  { name: "Luquinhas", positions: ["ATA"], currentStats: { fisico: 70, habilidade: 70, defesa: 50 }, pin: "1234" },
  { name: "Joao Miguel", positions: ["ATA"], currentStats: { fisico: 60, habilidade: 60, defesa: 60 }, pin: "1234" },
  { name: "Jeff Pai", positions: ["ZAG"], currentStats: { fisico: 60, habilidade: 70, defesa: 60 }, pin: "1234" },
  { name: "Victor Hugo", positions: ["ATA"], currentStats: { fisico: 60, habilidade: 80, defesa: 60 }, pin: "1234" },
  { name: "Mateus Souza", positions: ["ZAG"], currentStats: { fisico: 50, habilidade: 50, defesa: 50 }, pin: "1234" },
  { name: "Luciano", positions: ["ZAG"], currentStats: { fisico: 70, habilidade: 80, defesa: 70 }, pin: "1234" },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI nao definida. Crie um arquivo .env.local com a connection string.");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("perronhas");
    const col = db.collection("players");

    for (const player of PLAYERS) {
      await col.updateOne(
        { name: player.name },
        { $set: player },
        { upsert: true },
      );
    }

    const count = await col.countDocuments();
    console.log(`Seed concluido. ${count} jogadores no banco.`);
  } finally {
    await client.close();
  }
}

seed();

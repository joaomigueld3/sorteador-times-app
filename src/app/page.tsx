import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl border p-6 shadow-xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <h1 className="text-2xl font-black italic tracking-tighter text-center mb-2" style={{ color: "var(--text-primary)" }}>
          Perronhas<span style={{ color: "var(--accent)" }}>Rebirth</span>
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: "var(--text-secondary)" }}>
          Escolha uma area do sistema
        </p>

        <div className="grid grid-cols-1 gap-3">
          <Link href="/notas" className="rounded-xl px-4 py-4 font-bold text-sm text-center" style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}>
            Notas e Ranking
          </Link>
          <Link href="/sorteio" className="rounded-xl px-4 py-4 font-bold text-sm border text-center" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
            Sorteador Novo
          </Link>
          <Link href="/sorteador-antigo" className="rounded-xl px-4 py-4 font-bold text-sm border text-center" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
            Sorteador Antigo
          </Link>
        </div>
      </div>
    </main>
  );
}

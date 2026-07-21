"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import TeamDrawer from "../../components/TeamDrawer";
import { api, getErrorMessage } from "../../services/api";
import { MOCK_PLAYERS } from "../../data/mocks";

export default function SorteioPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [players, setPlayers] = useState<any[]>(MOCK_PLAYERS);
  const [backendError, setBackendError] = useState("");

  useEffect(() => {
    api.getPlayers()
      .then((data) => {
        if (Array.isArray(data)) {
          setPlayers(data);
          setBackendError("");
        }
      })
      .catch((error) => {
        setPlayers(MOCK_PLAYERS);
        setBackendError(`${getErrorMessage(error, "Nao foi possivel carregar jogadores do backend.")} Usando dados locais.`);
      });

    if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
  }, [theme]);

  return (
    <main className="min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-6 transition-colors duration-300">
      <header className="sticky top-0 z-30 px-3 py-2 shadow-sm backdrop-blur-md border-b" style={{ backgroundColor: "var(--bg-header)", borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Link href="/" className="text-lg font-black italic tracking-tighter text-white">
            Perronhas<span style={{ color: "var(--accent)" }}>Rebirth</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Link href="/" className="px-2.5 py-1.5 rounded-md text-xs font-bold bg-black/20 text-white md:hidden">INICIO</Link>
            <Link href="/notas" className="px-2.5 py-1.5 rounded-md text-xs font-bold bg-black/20 text-white">NOTAS</Link>
            <button onClick={() => setTheme((t) => t === "light" ? "dark" : "light")} className="p-2 rounded-full hover:bg-white/10 text-white">{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>
          </div>
        </div>
      </header>
      <div className="p-2.5 md:p-4 max-w-7xl mx-auto">
        {backendError && <div className="mb-4 rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: "#fca5a5", color: "#fecaca", backgroundColor: "rgba(127, 29, 29, 0.35)" }}>{backendError}</div>}
        <TeamDrawer players={players} />
      </div>
    </main>
  );
}

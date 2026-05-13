import { readFileSync } from "fs";
import { join } from "path";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SorteadorAntigoPage() {
  const filePath = join(process.cwd(), "preview.html");
  const html = readFileSync(filePath, "utf-8");

  return (
    <main>
      <div className="p-3 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
        <Link href="/" className="font-black italic" style={{ color: "var(--text-primary)" }}>
          Perronhas<span style={{ color: "var(--accent)" }}>Rebirth</span>
        </Link>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}

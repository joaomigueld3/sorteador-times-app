import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export default function SorteadorAntigoPage() {
  const filePath = join(process.cwd(), "preview.html");
  const html = readFileSync(filePath, "utf-8");

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

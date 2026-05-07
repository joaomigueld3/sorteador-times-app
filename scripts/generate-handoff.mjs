import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const run = (command) => {
  try {
    return execSync(command, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
};

const now = new Date();
const timestamp = now.toISOString();
const localTime = now.toLocaleString("pt-BR", { hour12: false });

const branch = run("git branch --show-current") || "unknown";
const head = run("git rev-parse --short HEAD") || "unknown";
const statusShort = run("git status --short");
const stagedDiff = run("git diff --cached --name-only");
const unstagedDiff = run("git diff --name-only");
const recentCommits = run("git log -5 --pretty=format:'- %h %s (%an, %ad)' --date=short");

const changedFiles = statusShort
  ? statusShort
      .split("\n")
      .filter(Boolean)
      .map((line) => `- ${line}`)
      .join("\n")
  : "- Nenhuma alteracao local";

const stagedFiles = stagedDiff
  ? stagedDiff
      .split("\n")
      .filter(Boolean)
      .map((line) => `- ${line}`)
      .join("\n")
  : "- Nenhum arquivo staged";

const unstagedFiles = unstagedDiff
  ? unstagedDiff
      .split("\n")
      .filter(Boolean)
      .map((line) => `- ${line}`)
      .join("\n")
  : "- Nenhum arquivo unstaged";

const commitLines = recentCommits || "- Nenhum commit encontrado";

const content = `# HANDOFF\n\n## Contexto\n- Gerado em: ${localTime} (${timestamp})\n- Branch: \`${branch}\`\n- HEAD: \`${head}\`\n\n## Estado Atual do Git\n### Alteracoes locais\n${changedFiles}\n\n### Staged\n${stagedFiles}\n\n### Unstaged\n${unstagedFiles}\n\n## Commits Recentes\n${commitLines}\n\n## Validacao Recomendada\n- \`npm run lint\`\n- \`npm run build\`\n\n## Proximos Passos\n- Revisar alteracoes acima e continuar pela feature em andamento.\n- Atualizar este arquivo ao final da sessao com \`npm run handoff\`.\n`;

const docsDir = join(process.cwd(), "docs");
const handoffPath = join(docsDir, "HANDOFF.md");
mkdirSync(docsDir, { recursive: true });
writeFileSync(handoffPath, content, "utf8");

console.log(`Generated ${handoffPath}`);

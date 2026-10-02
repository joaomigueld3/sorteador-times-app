#!/usr/bin/env node
// Verifica o projeto e mantém o bloco AUTO sincronizado no AGENTS.md
// Modos: --sync | --hook (Stop hook do Antigravity) | --precommit | --full
import { execSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';

const ROOT = process.cwd();
const AGENTS_MD = join(ROOT, 'AGENTS.md');
const START = '<!-- AUTO:START (gerado por scripts/project-check.mjs — não edite à mão) -->';
const END = '<!-- AUTO:END -->';
const mode = process.argv[2] ?? '--sync';

const walk = (dir) =>
    readdirSync(dir).flatMap((name) => {
        const p = join(dir, name);
        return statSync(p).isDirectory() ? walk(p) : [p];
    });

const srcFiles = existsSync(join(ROOT, 'src')) ? walk(join(ROOT, 'src'))
    .map((p) => relative(ROOT, p))
    .sort() : [];

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

const codeFiles = srcFiles.filter((f) => /\.(tsx?|css)$/.test(f));
const allText = codeFiles.map((f) => [f, readFileSync(join(ROOT, f), 'utf8')]);
const ENTRYPOINTS = new Set(['src/app/layout.tsx', 'src/app/page.tsx', 'src/app/globals.css', 'src/lib/mongodb.ts']);
const unused = codeFiles.filter((f) => {
    if (ENTRYPOINTS.has(f) || f.startsWith('src/app/api/') || f.includes('/page.tsx') || f.includes('/layout.tsx') || f.includes('/route.ts')) return false;
    const file = basename(f).replace(/\.(tsx?|css)$/, '');
    const stem = file === 'index' && !f.endsWith('.css') ? basename(dirname(f)) : file;
    const ref = f.endsWith('.css')
        ? new RegExp(`['"/]${stem}\\.css['"]`)
        : new RegExp(`['"/]${stem}(\\.tsx?)?['"]`);
    return !allText.some(([other, text]) => other !== f && ref.test(text));
});

const hash = createHash('sha1')
    .update(JSON.stringify({ srcFiles, scripts: pkg.scripts }))
    .digest('hex')
    .slice(0, 10);

const block = [
    START,
    `<!-- structure-hash: ${hash} -->`,
    '## Snapshot automático',
    '',
    `- **Scripts npm:** ${Object.keys(pkg.scripts).map((s) => "\`" + s + "\`").join(', ')}`,
    `- **Arquivos possivelmente não usados:** ${unused.length ? unused.map((f) => "\`" + f + "\`").join(', ') : 'nenhum'}`,
    '',
    '```text',
    ...srcFiles.filter((f) => !f.endsWith('.css')),
    '```',
    END,
].join('\n');

const current = existsSync(AGENTS_MD) ? readFileSync(AGENTS_MD, 'utf8') : '';
const re = new RegExp(`${START.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}[\\\\s\\\\S]*?${END}`);
const prevHash = current.match(/structure-hash: (\w+)/)?.[1];
const next = re.test(current) ? current.replace(re, block) : `${current.trimEnd()}\n\n${block}\n`;
const stale = next !== current;
const structureChanged = prevHash !== hash;

const run = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' });
const fail = (msg) => {
    if (mode === '--hook') {
        console.log(JSON.stringify({ decision: "continue", reason: msg }));
        process.exit(0);
    } else {
        process.stderr.write(`${msg}\n`);
        process.exit(mode === '--full' ? 1 : 2);
    }
};

if (mode === '--precommit') {
    if (stale) {
        process.stderr.write('AGENTS.md está desatualizado. Rode: node scripts/project-check.mjs --sync  (e git add AGENTS.md)\n');
        process.exit(1);
    }
} else if (stale) {
    writeFileSync(AGENTS_MD, next);
    if (mode !== '--hook') console.log('AGENTS.md: bloco automático atualizado.');
}

if (mode === '--sync') process.exit(0);

if (mode === '--hook') {
    try {
        // Antigravity manda JSON no stdin
        const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
        if (input.terminationReason) {
            // É a chamada de Stop
        }
    } catch { }

    const dirty = execSync('git status --porcelain -- src package.json', { cwd: ROOT, encoding: 'utf8' }).trim();
    if (!dirty) {
        console.log("{}");
        process.exit(0);
    }
    
    const problems = [];
    const tsc = run('npx', ['tsc', '--noEmit']);
    if (tsc.status !== 0) problems.push(`tsc falhou:\n${(tsc.stdout + tsc.stderr).slice(0, 1500)}`);
    const lint = run('npm', ['run', 'lint']);
    if (lint.status !== 0) problems.push(`lint falhou:\n${(lint.stdout + lint.stderr).slice(-1500)}`);
    
    if (structureChanged) {
        problems.push(
            'A estrutura do projeto mudou desde o último sync. O bloco automático do AGENTS.md já foi regenerado; ' +
            'revise agora as seções narrativas e corrija o que ficou desatualizado antes de terminar o trabalho.'
        );
    }

    if (problems.length) {
        fail(problems.join('\n\n'));
    } else {
        console.log("{}"); // Continua normal (permite parar)
    }
    process.exit(0);
}

// --precommit e --full: checagens completas
const problems = [];
const tsc = run('npx', ['tsc', '--noEmit']);
if (tsc.status !== 0) problems.push(`tsc falhou:\n${tsc.stdout}${tsc.stderr}`);
const lint = run('npm', ['run', 'lint']);
if (lint.status !== 0) problems.push(`lint falharam:\n${lint.stdout.slice(-1500)}${lint.stderr}`);

if (mode === '--full') {
    const audit = run('npm', ['audit', '--json']);
    try {
        const v = JSON.parse(audit.stdout).metadata.vulnerabilities;
        console.log(`npm audit: critical=${v.critical} high=${v.high} moderate=${v.moderate} low=${v.low}`);
        if (v.critical + v.high > 0) problems.push('npm audit: há vulnerabilidades critical/high (rode npm audit fix).');
    } catch {
        console.log('npm audit: não foi possível ler o resultado (offline?).');
    }
    const gitignore = existsSync(join(ROOT, '.gitignore')) ? readFileSync(join(ROOT, '.gitignore'), 'utf8') : '';
    for (const entry of ['node_modules', '.next', '.env']) {
        if (!gitignore.includes(entry)) problems.push(`.gitignore não contém "${entry}".`);
    }
    const tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' })
        .split('\n')
        .filter((f) => /(^|\/)\.env|\.(pem|key|secret)$/.test(f));
    if (tracked.length) problems.push(`arquivos sensíveis versionados: ${tracked.join(', ')}`);
    const risky = run('grep', ['-rnE', 'dangerouslySetInnerHTML|innerHTML\\s*=|document\\.write|eval\\(|new Function\\(', 'src']);
    if (risky.stdout.trim()) problems.push(`padrões de XSS/injeção encontrados:\n${risky.stdout}`);
    if (unused.length) console.log(`aviso: arquivos possivelmente não usados: ${unused.join(', ')}`);
}

if (problems.length) {
    process.stderr.write(`\n${problems.join('\n\n')}\n`);
    process.exit(1);
}
console.log('OK: tipos, linting e AGENTS.md em dia.');

import { readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const outputPath = resolve(process.argv[2] ?? '/private/tmp/source-code-document.html');
const softwareName = '滚一滚';
const version = 'V1.0.0';
const documentHeader = `${softwareName}${version}`;

const frontFiles = [
  'assets/scripts/CameraController.ts',
  'assets/scripts/AudioController.ts',
  'assets/scripts/ReleaseSaveRepository.ts',
  'assets/scripts/shared/platform/PlatformAdapter.ts',
  'assets/scripts/shared/game/coords.ts',
  'assets/scripts/shared/game/movement.ts',
  'assets/scripts/shared/game/PuzzleEngine.ts',
  'assets/scripts/shared/game/releaseSave.ts',
  'assets/scripts/shared/game/solver.ts',
  'assets/scripts/shared/game/onboarding.ts',
  'assets/scripts/BoardRenderer.ts',
];

const backFiles = [
  'assets/scripts/BlockPresenter.ts',
  'assets/scripts/GameplayController.ts',
  'assets/scripts/OnboardingVisual.ts',
];

const forbiddenContent = /copyright|\blicen[cs]e\b|bloxorz|jacob coughenour|20\d{2}[-/.年]/i;

function readSource(files) {
  return files.flatMap((file) => {
    const absolutePath = resolve(root, file);
    const lines = readFileSync(absolutePath, 'utf8').split(/\r?\n/);
    if (lines.at(-1) === '') lines.pop();
    return lines.map((text, index) => ({
      file,
      fileName: basename(file),
      lineNumber: index + 1,
      text,
    }));
  });
}

function paginate(lines, pageCount) {
  if (lines.length < pageCount * 50) {
    throw new Error(`Section has ${lines.length} lines; at least ${pageCount * 50} are required.`);
  }
  const baseSize = Math.floor(lines.length / pageCount);
  const extraPages = lines.length % pageCount;
  const pages = [];
  let offset = 0;
  for (let index = 0; index < pageCount; index += 1) {
    const pageSize = baseSize + (index < extraPages ? 1 : 0);
    pages.push(lines.slice(offset, offset + pageSize));
    offset += pageSize;
  }
  return pages;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderPage(lines, pageNumber) {
  const code = lines.map((line) => `
        <div class="code-line">
          <span class="line-number">${String(line.lineNumber).padStart(4, '0')}</span>
          <span class="source">${escapeHtml(line.text) || '&nbsp;'}</span>
        </div>`).join('');
  return `
    <section class="page">
      <header>${documentHeader}</header>
      <main>${code}
      </main>
      <footer>第 ${pageNumber} 页 / 共 60 页</footer>
    </section>`;
}

const frontLines = readSource(frontFiles);
const backLines = readSource(backFiles);
for (const line of [...frontLines, ...backLines]) {
  if (forbiddenContent.test(line.text)) {
    throw new Error(`Disallowed attribution, license, or date at ${line.file}:${line.lineNumber}`);
  }
}

const pages = [
  ...paginate(frontLines, 30),
  ...paginate(backLines, 30),
];
if (pages.length !== 60 || pages.some((page) => page.length < 50)) {
  throw new Error('Document pagination does not satisfy the 60-page, 50-line minimum.');
}
if (frontLines[0].lineNumber !== 1 || backLines.at(-1).text.trim() !== '}') {
  throw new Error('The document must begin at a module start and end at a module boundary.');
}

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>${softwareName}${version}软件源程序代码</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #000; }
    .page {
      width: 210mm;
      height: 297mm;
      padding: 9mm 11mm 9mm;
      break-after: page;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      background: #fff;
    }
    .page:last-child { break-after: auto; page-break-after: auto; }
    header {
      height: 8mm;
      border-bottom: 0.2mm solid #777;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font: 7.5pt/1.2 Arial, "PingFang SC", sans-serif;
      white-space: nowrap;
      overflow: hidden;
    }
    main { padding-top: 3mm; }
    .code-line {
      display: grid;
      grid-template-columns: 9mm minmax(0, 1fr);
      align-items: start;
      min-height: 3.05mm;
      font: 6.3pt/8.6pt Menlo, Monaco, Consolas, "Courier New", monospace;
    }
    .line-number {
      color: #666;
      user-select: none;
      border-right: 0.2mm solid #ddd;
      padding-right: 1.7mm;
      text-align: right;
    }
    .source {
      padding-left: 2mm;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      tab-size: 2;
    }
    footer {
      position: absolute;
      left: 11mm;
      right: 11mm;
      bottom: 4mm;
      border-top: 0.2mm solid #aaa;
      padding-top: 1.8mm;
      text-align: center;
      font: 8pt/1 Arial, "PingFang SC", sans-serif;
    }
  </style>
</head>
<body>${pages.map((page, index) => renderPage(page, index + 1)).join('')}
</body>
</html>`;

writeFileSync(outputPath, html);
console.log(JSON.stringify({
  outputPath,
  softwareName,
  version,
  totalPages: pages.length,
  frontLines: frontLines.length,
  backLines: backLines.length,
  minLinesPerPage: Math.min(...pages.map((page) => page.length)),
  maxLinesPerPage: Math.max(...pages.map((page) => page.length)),
  firstSource: `${frontLines[0].file}:${frontLines[0].lineNumber}`,
  lastSource: `${backLines.at(-1).file}:${backLines.at(-1).lineNumber}`,
}, null, 2));

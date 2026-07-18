/**
 * E2E 스모크 — 빌드 결과(dist/)를 실제 브라우저로 열어, 포털·전 게임·보조
 * 화면이 콘솔 오류 없이 렌더되는지 확인한다. 게임을 끝까지 자동 플레이하지는
 * 않고(각 게임 조작이 달라 유지비가 큼), "로드·초기 렌더" 회귀를 빠르게 잡는다.
 *
 * 실행: npm run e2e   (먼저 npm run build 로 dist/ 준비)
 * 브라우저 실행 파일은 환경변수 PLAYWRIGHT_CHROMIUM 로 지정할 수 있고,
 * 없으면 이 저장소가 돌아가는 관리형 환경의 기본 경로를 쓴다. 개발 PC에서는
 * `npx playwright install chromium` 후 PLAYWRIGHT_CHROMIUM 을 지정하면 된다.
 *
 * CI(자동 배포)에는 일부러 넣지 않았다 — 브라우저 내려받기가 배포를 느리고
 * 취약하게 만들고, '외부 의존 최소화' 원칙과도 어긋나기 때문. 개발자가 로컬에서
 * 회귀 점검용으로 돌리는 도구다.
 */
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const DIST = "dist";
const PORT = 4310;
const EXEC =
  process.env.PLAYWRIGHT_CHROMIUM || "/opt/pw-browsers/chromium";

const ROUTES = [
  ["", "포털"],
  ["#/certificate", "수료증"],
  ["#/report", "학습 리포트"],
  ["#/games/feed-algorithm", "1차시 알고리즘 설계자"],
  ["#/games/filter-bubble", "2차시 필터버블 탐지기"],
  ["#/games/social-insight", "3차시 추천 요정 훈련소"],
  ["#/games/trend-tycoon", "4차시 알고리즘 연구소장"],
  ["#/games/data-bias", "5차시 데이터 편식쟁이 AI"],
  ["#/games/deepfake", "6차시 완벽한 가짜"],
  ["#/games/fact-check", "7차시 누리봇 사실 검증단"],
  ["#/games/data-trail", "8차시 내 데이터의 여행"],
  ["#/games/short-form", "9차시 멈출 수 없는 화면"],
  ["#/games/gacha-box", "10차시 뽑기 상자의 비밀"],
  ["#/games/search-detective", "11차시 검색 결과 탐정"],
  ["#/games/chat-guard", "12차시 단톡방을 지켜라"],
  ["#/games/ai-privacy", "13차시 누리봇에게 말해도 될까?"],
  ["#/games/ai-fair", "14차시 모두의 AI"],
  ["#/games/ai-copyright", "15차시 누가 만들었게?"],
  ["#/games/ai-grow", "16차시 AI와 함께 크는 나"],
];

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function fail(msg) {
  console.error(`\n❌ ${msg}`);
  process.exit(1);
}

if (!existsSync(DIST)) fail(`${DIST}/ 가 없어요. 먼저 'npm run build' 를 실행하세요.`);
if (!existsSync(EXEC))
  fail(
    `크로미움 실행 파일을 찾지 못했어요: ${EXEC}\n` +
      `PLAYWRIGHT_CHROMIUM 환경변수로 경로를 지정하세요.`,
  );

// 아주 작은 정적 서버 — dist/ 를 그대로 서빙 (HashRouter라 SPA 폴백 불필요)
const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent((req.url || "/").split("?")[0]);
    if (path === "/") path = "/index.html";
    const full = join(DIST, normalize(path).replace(/^(\.\.[/\\])+/, ""));
    const body = await readFile(full);
    res.writeHead(200, { "Content-Type": MIME[extname(full)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

await new Promise((r) => server.listen(PORT, r));
const base = `http://localhost:${PORT}/`;

const browser = await chromium.launch({ executablePath: EXEC });
const results = [];
let failures = 0;

for (const [route, label] of ROUTES) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon/i.test(m.text())) errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
  try {
    await page.goto(base + route, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(500);
    const bodyLen = ((await page.textContent("body")) || "").trim().length;
    const ok = errors.length === 0 && bodyLen > 40;
    if (!ok) failures += 1;
    results.push({ label, ok, bodyLen, errors });
    console.log(
      `${ok ? "✅" : "❌"} ${label.padEnd(28)} len=${String(bodyLen).padStart(5)}` +
        (errors.length ? ` · ${errors.slice(0, 2).join(" | ")}` : ""),
    );
  } catch (e) {
    failures += 1;
    results.push({ label, ok: false, errors: [String(e)] });
    console.log(`❌ ${label.padEnd(28)} 로드 실패: ${e}`);
  }
  await page.close();
}

await browser.close();
server.close();

console.log(
  `\n${failures === 0 ? "✅ 전체 통과" : `❌ ${failures}건 실패`} — ${results.length}개 화면 점검`,
);
process.exit(failures === 0 ? 0 : 1);

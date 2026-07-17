import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path";
import fs from "fs";

// 게임 콘텐츠(src/content/*.json)를 빌드 산출물 dist/data/로 복사한다.
// 교사는 배포본의 data/*.json 파일을 텍스트 편집기로 수정해 게임 내용을
// 바꿀 수 있다(재빌드 불필요). 개발 서버에서도 같은 경로로 서빙한다.
function contentAsData(): Plugin {
  const contentDir = path.resolve(__dirname, "src/content");
  let outRoot = path.resolve(__dirname, "dist");
  let isOffline = false;
  return {
    name: "content-as-data",
    configResolved(config) {
      // 실제 outDir을 따라간다 — 오프라인 빌드(dist-offline)가 dist/를 오염시키지 않게
      outRoot = path.resolve(config.root, config.build.outDir);
      // 오프라인(단일 파일) 모드에서는 data/를 복사하지 않는다 — file://에선
      // fetch가 막혀 내장 콘텐츠(fallback)만 쓰이므로, 복사본은 도달 불가한 죽은 무게다.
      isOffline = config.mode === "offline";
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = req.url?.match(/^\/data\/([\w-]+\.json)$/);
        if (m) {
          const file = path.join(contentDir, m[1]);
          if (fs.existsSync(file)) {
            res.setHeader("Content-Type", "application/json");
            fs.createReadStream(file).pipe(res);
            return;
          }
        }
        next();
      });
    },
    closeBundle() {
      if (isOffline) return; // 오프라인 단일 파일엔 data/ 복사 불필요
      const outDir = path.join(outRoot, "data");
      if (!fs.existsSync(contentDir)) return;
      fs.mkdirSync(outDir, { recursive: true });
      for (const f of fs.readdirSync(contentDir)) {
        if (f.endsWith(".json")) {
          fs.copyFileSync(path.join(contentDir, f), path.join(outDir, f));
        }
      }
    },
  };
}

// base "./" — 하위 경로 배포를 지원한다.
// 오프라인 배포는 `npm run build:offline`(--mode offline)으로 만든다:
// JS/CSS를 전부 인라인한 단일 HTML 한 장이 나오므로, 웹 서버 없이
// 파일을 더블클릭해도(file://) 실행된다. (일반 빌드의 모듈 스크립트는
// 브라우저 보안 정책상 file://에서 차단되기 때문)
export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    port: 8080,
  },
  plugins: [
    react(),
    contentAsData(),
    mode === "offline" && viteSingleFile({ removeViteModuleLoader: true }),
  ].filter(Boolean),
  build:
    mode === "offline"
      ? {
          outDir: "dist-offline",
          reportCompressedSize: false,
          // 폰트 등 에셋까지 전부 data URI로 인라인해 진짜 '한 파일'을 만든다
          assetsInlineLimit: 100 * 1024 * 1024,
        }
      : undefined,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

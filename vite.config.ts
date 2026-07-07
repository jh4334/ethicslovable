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
  return {
    name: "content-as-data",
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
      const outDir = path.resolve(__dirname, "dist/data");
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
      ? { outDir: "dist-offline", reportCompressedSize: false }
      : undefined,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

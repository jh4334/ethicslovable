import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
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

// base "./" — 하위 경로 배포와 오프라인(file://) 실행을 모두 지원한다.
export default defineConfig({
  base: "./",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), contentAsData()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

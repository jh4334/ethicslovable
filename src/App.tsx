import { lazy, Suspense, type ComponentType } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import PortalPage from "./portal/PortalPage";
import CertificatePage from "./portal/CertificatePage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import FontScaleControl from "./components/FontScaleControl";

/**
 * 게임은 라우트별로 지연 로딩한다 — 저사양 PC에서 첫 화면을 가볍게.
 * 재배포 방어: 탭을 열어 둔 사이 서버가 새 빌드로 바뀌면 옛 해시 청크가
 * 404가 되며 게임 화면이 하얗게 죽는다. 청크 로드가 실패하면 한 번만
 * 새로고침해 새 빌드를 받아온다(세션 플래그로 무한 새로고침 방지).
 */
function lazyGame(factory: () => Promise<{ default: ComponentType }>) {
  const RELOAD_KEY = "mlq-chunk-reload";
  return lazy(() =>
    factory().then(
      (mod) => {
        try {
          sessionStorage.removeItem(RELOAD_KEY);
        } catch {
          /* 저장소 차단은 무시 */
        }
        return mod;
      },
      (err) => {
        let canReload = false;
        try {
          canReload = sessionStorage.getItem(RELOAD_KEY) !== "1";
          if (canReload) sessionStorage.setItem(RELOAD_KEY, "1");
        } catch {
          /* 저장소 차단이면 새로고침 1회 보장이 안 되므로 그대로 실패 처리 */
        }
        if (!canReload) throw err;
        window.location.reload();
        // 새로고침되는 동안 로딩 화면을 유지한다
        return new Promise<{ default: ComponentType }>(() => {});
      },
    ),
  );
}

const FeedAlgorithmGame = lazyGame(() => import("./games/feed-algorithm"));
const FilterBubbleGame = lazyGame(() => import("./games/filter-bubble"));
const SocialInsightGame = lazyGame(() => import("./games/social-insight"));
const TrendTycoonGame = lazyGame(() => import("./games/trend-tycoon"));
const DataBiasGame = lazyGame(() => import("./games/data-bias"));
const DeepfakeGame = lazyGame(() => import("./games/deepfake"));
const FactCheckGame = lazyGame(() => import("./games/fact-check"));
const DataTrailGame = lazyGame(() => import("./games/data-trail"));
const ShortFormGame = lazyGame(() => import("./games/short-form"));
const GachaBoxGame = lazyGame(() => import("./games/gacha-box"));
const SearchDetectiveGame = lazyGame(() => import("./games/search-detective"));
const ChatGuardGame = lazyGame(() => import("./games/chat-guard"));
const AiPrivacyGame = lazyGame(() => import("./games/ai-privacy"));
const AiFairGame = lazyGame(() => import("./games/ai-fair"));
const AiCopyrightGame = lazyGame(() => import("./games/ai-copyright"));
const AiGrowGame = lazyGame(() => import("./games/ai-grow"));

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      게임을 불러오는 중이에요…
    </div>
  );
}

// HashRouter — 웹 서버 하위 경로 배포와 file:// 오프라인 실행을 모두 지원.
// MotionConfig reducedMotion="user" — 사용자의 '동작 줄이기' 설정을 framer-motion
// 전역에서 존중한다(개별 컴포넌트 수정 없이 한 곳에서). ErrorBoundary — 게임
// 하나의 예외가 앱 전체를 무너뜨리지 않게 라우트 전체를 감싼다.
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <Toaster position="top-center" richColors />
        <FontScaleControl />
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Routes>
          <Route path="/" element={<PortalPage />} />
          <Route path="/certificate" element={<CertificatePage />} />
          <Route path="/games/feed-algorithm" element={<FeedAlgorithmGame />} />
          <Route path="/games/filter-bubble" element={<FilterBubbleGame />} />
          <Route path="/games/social-insight" element={<SocialInsightGame />} />
          <Route path="/games/trend-tycoon" element={<TrendTycoonGame />} />
          <Route path="/games/data-bias" element={<DataBiasGame />} />
          <Route path="/games/deepfake" element={<DeepfakeGame />} />
          <Route path="/games/fact-check" element={<FactCheckGame />} />
          <Route path="/games/data-trail" element={<DataTrailGame />} />
          <Route path="/games/short-form" element={<ShortFormGame />} />
          <Route path="/games/gacha-box" element={<GachaBoxGame />} />
          <Route path="/games/search-detective" element={<SearchDetectiveGame />} />
          <Route path="/games/chat-guard" element={<ChatGuardGame />} />
          <Route path="/games/ai-privacy" element={<AiPrivacyGame />} />
          <Route path="/games/ai-fair" element={<AiFairGame />} />
          <Route path="/games/ai-copyright" element={<AiCopyrightGame />} />
          <Route path="/games/ai-grow" element={<AiGrowGame />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </HashRouter>
    </MotionConfig>
  );
}

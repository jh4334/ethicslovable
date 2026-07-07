import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import PortalPage from "./portal/PortalPage";
import NotFound from "./pages/NotFound";

// 게임은 라우트별로 지연 로딩한다 — 저사양 PC에서 첫 화면을 가볍게.
const FeedAlgorithmGame = lazy(() => import("./games/feed-algorithm"));
const FilterBubbleGame = lazy(() => import("./games/filter-bubble"));
const SocialInsightGame = lazy(() => import("./games/social-insight"));
const TrendTycoonGame = lazy(() => import("./games/trend-tycoon"));
const DataBiasGame = lazy(() => import("./games/data-bias"));
const DeepfakeGame = lazy(() => import("./games/deepfake"));
const FactCheckGame = lazy(() => import("./games/fact-check"));
const DataTrailGame = lazy(() => import("./games/data-trail"));

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      게임을 불러오는 중이에요…
    </div>
  );
}

// HashRouter — 웹 서버 하위 경로 배포와 file:// 오프라인 실행을 모두 지원.
export default function App() {
  return (
    <HashRouter>
      <Toaster position="top-center" richColors />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<PortalPage />} />
          <Route path="/games/feed-algorithm" element={<FeedAlgorithmGame />} />
          <Route path="/games/filter-bubble" element={<FilterBubbleGame />} />
          <Route path="/games/social-insight" element={<SocialInsightGame />} />
          <Route path="/games/trend-tycoon" element={<TrendTycoonGame />} />
          <Route path="/games/data-bias" element={<DataBiasGame />} />
          <Route path="/games/deepfake" element={<DeepfakeGame />} />
          <Route path="/games/fact-check" element={<FactCheckGame />} />
          <Route path="/games/data-trail" element={<DataTrailGame />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

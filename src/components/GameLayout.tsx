import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import type { GameId } from "@/lib/progress";
import { cn } from "@/lib/utils";

interface GameLayoutProps {
  gameId: GameId;
  lesson: number;
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * 모든 게임 공통 셸: 상단에 포털로 돌아가는 바를 두고,
 * 게임 고유 스타일을 .game-<id> 클래스로 범위 지정한다.
 */
export default function GameLayout({ gameId, lesson, title, children, className }: GameLayoutProps) {
  return (
    <div className={cn(`game-${gameId}`, "flex min-h-screen flex-col", className)}>
      {/* 키보드·스크린리더 사용자용 본문 바로가기 */}
      <a
        href="#game-main"
        className="sr-only rounded-lg bg-card px-3 py-2 text-sm font-bold text-foreground shadow focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60]"
      >
        본문 바로가기
      </a>
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-card/85 backdrop-blur-md">
        <div className="container flex h-12 items-center justify-between">
          {/* 히트영역 최소 44px 확보(태블릿) — 시각 크기는 그대로, 세로 패딩만 확대 */}
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2.5 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            퀘스트 지도로
          </Link>
          <span className="inline-flex items-center gap-2 text-sm font-extrabold">
            <span className="mlq-gradient rounded-full px-2.5 py-0.5 text-[11px] font-black text-white">
              {lesson}차시
            </span>
            {title}
          </span>
        </div>
      </nav>
      {/* 게임 본문 랜드마크 — SR 랜드마크 탐색과 스킵 링크 목표 */}
      <main id="game-main" className="flex-1">
        {children}
      </main>
    </div>
  );
}

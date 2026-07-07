/**
 * 11차시 · 검색 결과 탐정
 * 플레이어는 '누리마을 지킴이 검색 탐정'이 되어, 검색 포털 '누리찾기'에서
 * 주민들의 검색 미션 6개를 해결한다.
 * 핵심 배움: 검색 결과는 위에서부터 순서대로 믿는 게 아니다 — 광고 표시,
 * 출처, 협찬 문구, 날짜를 확인하는 눈을 기른다.
 * 콘텐츠(미션·검색 결과·단서 도감)는 src/content/search-detective.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/search-detective.json";
import type { SdContent } from "./types";
import { useSearchDetectiveGame } from "./useSearchDetectiveGame";
import StartScreen from "./components/StartScreen";
import PlayScreen from "./components/PlayScreen";
import ResultScreen from "./components/ResultScreen";
import "./styles.css";

function GameBody({ content }: { content: SdContent }) {
  const game = useSearchDetectiveGame(content);

  if (game.phase === "playing") return <PlayScreen content={content} game={game} />;
  if (game.phase === "result") return <ResultScreen content={content} game={game} />;
  return <StartScreen content={content} onStart={game.start} />;
}

export default function SearchDetectiveGame() {
  const [content, setContent] = useState<SdContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<SdContent>("search-detective", fallbackContent as SdContent).then(
      (loaded) => {
        if (alive) setContent(loaded);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GameLayout gameId="search-detective" lesson={11} title="검색 결과 탐정">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center text-sm text-muted-foreground">
          누리찾기를 여는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

/**
 * 8차시 · 내 데이터의 여행
 * '데이터 여행자'가 되어 가상 SNS 누리피드를 써 보고(파트 A),
 * 내가 남긴 데이터 조각이 수집→저장→분석→프로필→맞춤 광고로 이어지는
 * 길을 추적한 뒤(파트 B), 내 데이터를 지키는 선택을 연습한다(파트 C).
 *
 * 이 게임의 "데이터 수집"은 페이지 안 메모리에서만 흉내 내며,
 * 행동 기록은 어디에도 저장·전송하지 않는다. (학습 완료 기록만 progress에 저장)
 * 콘텐츠(게시물·광고·시나리오·문구)는 src/content/data-trail.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/data-trail.json";
import type { DtContent } from "./types";
import { useDataTrailGame } from "./useDataTrailGame";
import IntroScreen from "./IntroScreen";
import FeedScreen from "./FeedScreen";
import JourneyScreen from "./JourneyScreen";
import ProtectScreen from "./ProtectScreen";
import ResultScreen from "./ResultScreen";
import "./styles.css";

function GameBody({ content }: { content: DtContent }) {
  const game = useDataTrailGame(content);

  if (game.phase === "feed") return <FeedScreen content={content} game={game} />;
  if (game.phase === "journey") return <JourneyScreen content={content} game={game} />;
  if (game.phase === "protect") return <ProtectScreen content={content} game={game} />;
  if (game.phase === "result") return <ResultScreen content={content} game={game} />;
  return <IntroScreen content={content} onStart={game.startFeed} />;
}

export default function DataTrailGame() {
  const [content, setContent] = useState<DtContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<DtContent>("data-trail", fallbackContent as unknown as DtContent).then(
      (loaded) => {
        if (alive) setContent(loaded);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GameLayout gameId="data-trail" lesson={8} title="내 데이터의 여행">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center text-sm text-muted-foreground">
          데이터 여행 가방을 싸는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

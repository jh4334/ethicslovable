/**
 * 9차시 · 멈출 수 없는 화면
 * 누리마을 지킴이가 숏폼 앱 '누리숏'에 잠입해, 앱이 왜 멈추기 어려운지를
 * 몸으로 조사한다: 무한 피드 체험 → 시간 퀴즈 → 멈추기 챌린지(다크패턴 체험)
 * → 설계 해부 → 조사 보고서.
 *
 * 시간은 실제 시간이 아니라 가상 시간(영상 1개 = 30초)으로 계산하고,
 * 체험 중에는 시계를 일부러 보여 주지 않는다(교육 장치).
 * 콘텐츠(영상 목록·문구·규칙)는 src/content/short-form.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/short-form.json";
import type { SfContent } from "./types";
import { useShortFormGame } from "./useShortFormGame";
import IntroScreen from "./IntroScreen";
import FeedScreen from "./FeedScreen";
import EndScreen from "./EndScreen";
import RevealScreen from "./RevealScreen";
import ResultScreen from "./ResultScreen";
import "./styles.css";

function GameBody({ content }: { content: SfContent }) {
  const game = useShortFormGame(content);

  if (game.phase === "feed") return <FeedScreen content={content} game={game} />;
  if (game.phase === "ending") return <EndScreen content={content} game={game} />;
  if (game.phase === "reveal") return <RevealScreen content={content} game={game} />;
  if (game.phase === "result") return <ResultScreen content={content} game={game} />;
  return <IntroScreen content={content} onStart={game.startFeed} />;
}

export default function ShortFormGame() {
  const [content, setContent] = useState<SfContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<SfContent>("short-form", fallbackContent as unknown as SfContent).then(
      (loaded) => {
        if (alive) setContent(loaded);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GameLayout gameId="short-form" lesson={9} title="멈출 수 없는 화면">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center text-sm text-muted-foreground">
          누리숏에 접속하는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

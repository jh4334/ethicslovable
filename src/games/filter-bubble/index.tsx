import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/filter-bubble.json";
import ExitGuard from "@/components/ExitGuard";
import { IntroScreen } from "./IntroScreen";
import { GameScreen } from "./GameScreen";
import { ResultScreen } from "./ResultScreen";
import { useAlgorithmGame } from "./useAlgorithmGame";
import type { FilterBubbleContent } from "./types";
import "./styles.css";

/**
 * 필터버블 탐지기 (2차시) — 알고리즘 성향 테스트.
 * 공평하게 주어지는 카드 속에서 내 선택이 얼마나 쏠리는지 확인하고,
 * 필터버블 위험도(HHI 기반)를 알아보는 게임.
 */

function GameFlow({ content }: { content: FilterBubbleContent }) {
  const { gameState, clicks, history, feed, persona, startGame, handleCardClick } =
    useAlgorithmGame(content);

  if (gameState === "intro") {
    return <IntroScreen categories={content.categories} onStart={startGame} />;
  }

  if (gameState === "finished" && persona) {
    return (
      <ResultScreen
        history={history}
        persona={persona}
        content={content}
        onRestart={startGame}
      />
    );
  }

  return (
    <>
      <ExitGuard />
      <GameScreen
        feed={feed}
        clicks={clicks}
        categories={content.categories}
        onCardClick={handleCardClick}
      />
    </>
  );
}

export default function FilterBubbleGame() {
  const [content, setContent] = useState<FilterBubbleContent | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadContent<FilterBubbleContent>(
      "filter-bubble",
      fallbackContent as unknown as FilterBubbleContent,
    ).then((loaded) => {
      if (!cancelled) setContent(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GameLayout gameId="filter-bubble" lesson={2} title="필터버블 탐지기">
      {content ? (
        <GameFlow content={content} />
      ) : (
        <div className="fb-screen flex items-center justify-center text-muted-foreground">
          게임 자료를 불러오는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

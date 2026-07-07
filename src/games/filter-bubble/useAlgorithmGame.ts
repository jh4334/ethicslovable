import { useCallback, useMemo, useState } from "react";
import { buildPersona } from "./logic";
import type { ContentItem, FilterBubbleContent, Persona } from "./types";

export type GameState = "intro" | "playing" | "finished";

export const TOTAL_ROUNDS = 10;

/**
 * 알고리즘 성향 테스트 게임 상태.
 * 매 라운드 8개 분야 × 2개씩 공평하게 카드를 깔고(이미 본 카드는 제외),
 * 10번의 선택 기록으로 성향과 필터버블 위험도를 계산한다.
 */
export function useAlgorithmGame(content: FilterBubbleContent) {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [clicks, setClicks] = useState(0);
  const [history, setHistory] = useState<ContentItem[]>([]);
  const [feed, setFeed] = useState<ContentItem[]>([]);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());

  // 균형 피드 생성 — 분야마다 아직 안 본 카드 중 2개씩 무작위로 뽑는다
  const generateFeed = useCallback(
    (currentSeenIds: Set<number>) => {
      const nextFeed: ContentItem[] = [];
      const newPageIds: number[] = [];

      content.categories.forEach((cat) => {
        const catItems = content.items.filter(
          (item) => item.category === cat.id && !currentSeenIds.has(item.id),
        );

        const shuffled = [...catItems].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 2);

        selected.forEach((item) => {
          nextFeed.push(item);
          newPageIds.push(item.id);
        });
      });

      const finalFeed = [...nextFeed].sort(() => Math.random() - 0.5);

      setSeenIds((prev) => {
        const next = new Set(prev);
        newPageIds.forEach((id) => next.add(id));
        return next;
      });

      setFeed(finalFeed);
    },
    [content],
  );

  const startGame = useCallback(() => {
    setGameState("playing");
    setClicks(0);
    setHistory([]);
    setSeenIds(new Set());
    generateFeed(new Set());
  }, [generateFeed]);

  const handleCardClick = useCallback(
    (item: ContentItem) => {
      if (clicks >= TOTAL_ROUNDS) return;

      setHistory((prev) => [...prev, item]);

      const newClicks = clicks + 1;
      setClicks(newClicks);

      if (newClicks < TOTAL_ROUNDS) {
        generateFeed(seenIds);
      } else {
        setTimeout(() => setGameState("finished"), 500);
      }
    },
    [clicks, seenIds, generateFeed],
  );

  const persona: Persona | null = useMemo(
    () => (gameState === "finished" ? buildPersona(history, content) : null),
    [gameState, history, content],
  );

  return {
    gameState,
    clicks,
    history,
    feed,
    persona,
    startGame,
    handleCardClick,
  };
}

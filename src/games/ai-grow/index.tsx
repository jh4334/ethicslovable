/**
 * 16차시 · AI와 함께 크는 나 (4부 마무리 · 핵심 가치: 성장)
 * 플레이어는 AI 비서 '누리봇'과 함께 공부하는 '나'가 되어, 여러 학습 상황에서
 * 'AI에게 베끼기' vs 'AI로 배우기'를 고른다. 정답은 옳고 그름 단순화가 아니라
 * '이 선택이 나를 키우는가'로 프레이밍하고, 나를 키우는 선택마다 '성장 씨앗'을 모은다.
 * 이어 'AI가 잘하는 것 vs 나만 할 수 있는 것'을 분류하며 "AI는 도구, 주인공은 나"를
 * 체험하고, 마지막에 성장 등급·3가지 약속·16차시 전체 여정 수료 문구로 마무리한다.
 * 콘텐츠(상황·선택지·분류 항목·약속)는 src/content/ai-grow.json 에서 분리 관리.
 * 근거: 충북형 AI 윤리 가이드라인 PART3·4, 세부원칙 10·11.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/ai-grow.json";
import type { AgContent } from "./types";
import { useAiGrowGame } from "./useAiGrowGame";
import StartScreen from "./components/StartScreen";
import SituationScreen from "./components/SituationScreen";
import SortScreen from "./components/SortScreen";
import FinaleScreen from "./components/FinaleScreen";
import "./styles.css";

function GameBody({ content }: { content: AgContent }) {
  const game = useAiGrowGame(content);

  if (game.phase === "situations")
    return <SituationScreen content={content} game={game} />;
  if (game.phase === "sort")
    return <SortScreen content={content} game={game} />;
  if (game.phase === "finale")
    return <FinaleScreen content={content} game={game} />;
  return <StartScreen content={content} onStart={game.start} />;
}

export default function AiGrowGame() {
  const [content, setContent] = useState<AgContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<AgContent>("ai-grow", fallbackContent as unknown as AgContent).then(
      (loaded) => {
        if (alive) setContent(loaded);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GameLayout gameId="ai-grow" lesson={16} title="AI와 함께 크는 나">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center text-sm text-muted-foreground">
          성장 여정을 준비하는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

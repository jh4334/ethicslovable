/**
 * 16차시 · AI와 함께 크는 나 (4부 마무리 · 핵심 가치: 성장)
 *
 * 핵심 메시지: AI는 '아는 사람'에게 훨씬 큰 힘이 된다. 도메인 지식이 있어야
 * 좋은 질문을 하고, AI 답의 오류를 잡아내고, 그 위에 발전시킬 수 있다.
 * 그래서 'AI에 다 맡기기'가 아니라 '나도 배워서 AI를 제대로 부리기'가 성장이다.
 *
 * 플레이어는 누리봇과 함께 분야별 미션을 4단계로 해결한다:
 *   ① 배우기(지식 카드) → ② 좋은 질문(프롬프트) → ③ AI 답 검토(오류 잡기)
 *   → ④ 발전시키기 → 미션 결과. 마지막에 누리봇의 되물음·성장 등급으로 마무리.
 * 지식 보유 여부가 ②③④·되물음의 성패를 가른다(useAiGrowGame 참고).
 *
 * 콘텐츠(미션·지식 카드·질문·AI 답·약속)는 src/content/ai-grow.json 에서 분리 관리.
 * 근거: 충북형 AI 윤리 가이드라인 PART3(AI 결과물 의존)·PART4(오류·할루시네이션 검증),
 *       세부원칙 10(주도적 활용)·11(창의·협력적 학습), 실천가치 'AI 리터러시'.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/ai-grow.json";
import type { AgContent } from "./types";
import { useAiGrowGame } from "./useAiGrowGame";
import StartScreen from "./components/StartScreen";
import MissionScreen from "./components/MissionScreen";
import FinaleScreen from "./components/FinaleScreen";
import "./styles.css";

function GameBody({ content }: { content: AgContent }) {
  const game = useAiGrowGame(content);

  if (game.phase === "mission")
    return <MissionScreen content={content} game={game} />;
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
          성장 미션을 준비하는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

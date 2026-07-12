/**
 * 14차시 · 모두의 AI (스테이지형 포용 퍼즐)
 * 누리봇을 '모두가 쓸 수 있게 만드는 포용 설계자'가 되어, 장벽 있는 친구를
 * 손님으로 한 명씩 맞이한다. 손님의 이야기와 누리봇의 반응을 관찰해 개선 카드
 * 하나를 골라 시험하고(틀리면 왜 안 됐는지 읽고 재도전), 손님을 모두 도우면
 * 개선을 딱 3개만 남겨 여섯 명 전원을 유지해야 하는 '최종 설계 심사'를 치른다.
 * 한 개선이 두 장벽을 덮는다는 통찰이 심사의 열쇠. 배움은 플레이에서 드러난다.
 * 근거: 충북형 AI 윤리 가이드라인 세부원칙 4(편향 최소화)·5(다양성)·6(취약계층 접근).
 * 콘텐츠(친구·장벽·개선 카드·문구)는 src/content/ai-fair.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/ai-fair.json";
import type { AfContent } from "./types";
import { useAiFairGame } from "./useAiFairGame";
import IntroScreen from "./components/IntroScreen";
import StageScreen from "./components/StageScreen";
import FinalScreen from "./components/FinalScreen";
import InsightScreen from "./components/InsightScreen";
import ResultScreen from "./components/ResultScreen";
import "./styles.css";

function GameBody({ content }: { content: AfContent }) {
  const game = useAiFairGame(content);

  if (game.phase === "stage") return <StageScreen content={content} game={game} />;
  if (game.phase === "final") return <FinalScreen content={content} game={game} />;
  if (game.phase === "insight") return <InsightScreen content={content} game={game} />;
  if (game.phase === "result") return <ResultScreen content={content} game={game} />;
  return <IntroScreen content={content} onStart={game.start} />;
}

export default function AiFairGame() {
  const [content, setContent] = useState<AfContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<AfContent>("ai-fair", fallbackContent as AfContent).then((loaded) => {
      if (!alive) return;
      // 서버의 data/ai-fair.json이 옛 스키마(스테이지 개편 전)면 내장 콘텐츠로
      // 대체한다 — 재빌드 없이 데이터만 남은 배포에서도 게임이 깨지지 않게.
      const valid = Array.isArray(loaded?.stageOrder) && loaded?.finalStage?.budget != null;
      setContent(valid ? loaded : (fallbackContent as AfContent));
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GameLayout gameId="ai-fair" lesson={14} title="모두의 AI">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center text-sm text-muted-foreground">
          포용 설계실 문을 여는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

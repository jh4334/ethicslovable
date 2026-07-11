/**
 * 14차시 · 모두의 AI (포용 퍼즐)
 * 누리봇을 '모두가 쓸 수 있게 만드는 포용 설계자'가 되어, 개선 카드를 슬롯에
 * 장착 → '다시 시험하기' → 여섯 친구가 쓸 수 있는지 재판정하는 넣기→테스트→개선
 * 루프를 돌린다. 처음엔 '평균적인 사람' 기준이라 2명만 쓰지만, 사투리·다문화·
 * 시각·농산어촌 장벽을 하나씩 없애 6/6을 만든다. 배움은 플레이에서 저절로 드러난다.
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
import BuildScreen from "./components/BuildScreen";
import InsightScreen from "./components/InsightScreen";
import ResultScreen from "./components/ResultScreen";
import "./styles.css";

function GameBody({ content }: { content: AfContent }) {
  const game = useAiFairGame(content);

  if (game.phase === "build") return <BuildScreen content={content} game={game} />;
  if (game.phase === "insight") return <InsightScreen content={content} game={game} />;
  if (game.phase === "result") return <ResultScreen content={content} game={game} />;
  return <IntroScreen content={content} onStart={game.start} />;
}

export default function AiFairGame() {
  const [content, setContent] = useState<AfContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<AfContent>("ai-fair", fallbackContent as AfContent).then((loaded) => {
      if (alive) setContent(loaded);
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

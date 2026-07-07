/**
 * 5차시 · 데이터 편식쟁이 AI
 * 누리소프트 AI 연구소의 AI 훈련사가 되어 새내기 AI '아기봇'에게
 * 동물 사진 데이터를 골라 먹이며, "AI는 먹은(학습한) 데이터만큼만 안다 —
 * 편향된 데이터는 편향된 AI를 만든다"를 두 라운드에 걸쳐 체험한다.
 * 콘텐츠(카드·대사·문구)는 src/content/data-bias.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/data-bias.json";
import type { DbContent } from "./types";
import { useDataBiasGame } from "./useDataBiasGame";
import IntroScreen from "./components/IntroScreen";
import TrainScreen from "./components/TrainScreen";
import TestScreen from "./components/TestScreen";
import RoundResultScreen from "./components/RoundResultScreen";
import ReflectionScreen from "./components/ReflectionScreen";
import "./styles.css";

function GameBody({ content }: { content: DbContent }) {
  const game = useDataBiasGame(content);

  if (game.phase === "train") return <TrainScreen content={content} game={game} />;
  if (game.phase === "test") return <TestScreen content={content} game={game} />;
  if (game.phase === "roundResult") return <RoundResultScreen content={content} game={game} />;
  if (game.phase === "reflection") return <ReflectionScreen content={content} game={game} />;
  return <IntroScreen content={content} onStart={game.start} />;
}

export default function DataBiasGame() {
  const [content, setContent] = useState<DbContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<DbContent>("data-bias", fallbackContent as DbContent).then((loaded) => {
      if (alive) setContent(loaded);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GameLayout gameId="data-bias" lesson={5} title="데이터 편식쟁이 AI">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center text-sm text-muted-foreground">
          연구소 문을 여는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

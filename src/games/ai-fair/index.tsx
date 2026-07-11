/**
 * 14차시 · 모두의 AI
 * 누리봇의 '공정 검사관'이 되어, 누리봇이 누구에게나 공평하게 잘 도와주는지
 * 시험한다. 사투리·다문화·시각장애·농산어촌·유료 격차 사례를 살펴 편향·차별을
 * 찾아내고(1부), 사람이 아니라 AI 설계를 고쳐 모두가 쓸 수 있게 만든다(2부).
 * "AI는 모두를 똑같이 잘 돕지 않을 수 있다 — 살펴서 모두가 공평하게 쓸 수 있게"를
 * 체험한다. 근거: 충북형 AI 윤리 가이드라인 세부원칙 4·5·6, PART5 학생평가.
 * 콘텐츠(사용자·도감·고치기 문구)는 src/content/ai-fair.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/ai-fair.json";
import type { AfContent } from "./types";
import { useAiFairGame } from "./useAiFairGame";
import IntroScreen from "./components/IntroScreen";
import InspectScreen from "./components/InspectScreen";
import FixScreen from "./components/FixScreen";
import ResultScreen from "./components/ResultScreen";
import "./styles.css";

function GameBody({ content }: { content: AfContent }) {
  const game = useAiFairGame(content);

  if (game.phase === "inspect") return <InspectScreen content={content} game={game} />;
  if (game.phase === "fix") return <FixScreen content={content} game={game} />;
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
          공정 검사실 문을 여는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

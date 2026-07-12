/**
 * 6차시 · 완벽한 가짜
 * 누리마을 가짜 콘텐츠 수사대의 새내기 수사관이 되어,
 * 1부 '눈 시험'에서 진짜와 AI 콘텐츠를 눈으로 가려 보고(사실상 못 가림),
 * 2부 '검증 수사'에서 도구 4개(멈춤→출처→원본→공식 확인)로 사건을 해결한다.
 * 핵심 배움: 요즘 AI 가짜는 눈으로 못 가려낸다. 그래서 단서가 아니라
 * '검증 절차'로 판단한다.
 * 콘텐츠(라운드·사건·문구)는 src/content/deepfake.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/deepfake.json";
import type { DfContent } from "./types";
import { useDeepfakeGame } from "./useDeepfakeGame";
import StartScreen from "./components/StartScreen";
import EyeTestScreen from "./components/EyeTestScreen";
import MidResultScreen from "./components/MidResultScreen";
import CaseScreen from "./components/CaseScreen";
import ResultScreen from "./components/ResultScreen";
import ExitGuard from "@/components/ExitGuard";
import "./styles.css";

function GameBody({ content }: { content: DfContent }) {
  const game = useDeepfakeGame(content);

  if (game.phase === "eye")
    return (
      <>
        <ExitGuard />
        <EyeTestScreen content={content} game={game} />
      </>
    );
  if (game.phase === "mid")
    return (
      <>
        <ExitGuard />
        <MidResultScreen content={content} game={game} />
      </>
    );
  if (game.phase === "case")
    return (
      <>
        <ExitGuard />
        <CaseScreen content={content} game={game} />
      </>
    );
  if (game.phase === "result") return <ResultScreen content={content} game={game} />;
  return <StartScreen content={content} onStart={game.start} />;
}

export default function DeepfakeGame() {
  const [content, setContent] = useState<DfContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<DfContent>("deepfake", fallbackContent as unknown as DfContent).then(
      (loaded) => {
        if (alive) setContent(loaded);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GameLayout gameId="deepfake" lesson={6} title="완벽한 가짜">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center text-sm text-muted-foreground">
          수사 본부의 문을 여는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

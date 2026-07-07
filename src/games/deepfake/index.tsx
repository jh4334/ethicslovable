/**
 * 6차시 · 딥페이크 탐정단
 * 누리마을 가짜 콘텐츠 수사대의 탐정이 되어, AI가 만든 가짜 사진·글을
 * 진짜와 가려내고 단서를 수첩에 모은다. 핵심 배움: 가짜는 단서로 알아챌 수
 * 있지만 단서만으로는 부족하다 — 마지막 무기는 출처 확인!
 * 콘텐츠(사건·단서·문구)는 src/content/deepfake.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/deepfake.json";
import type { DfContent } from "./types";
import { useDeepfakeGame } from "./useDeepfakeGame";
import StartScreen from "./components/StartScreen";
import PlayScreen from "./components/PlayScreen";
import ResultScreen from "./components/ResultScreen";
import "./styles.css";

function GameBody({ content }: { content: DfContent }) {
  const game = useDeepfakeGame(content);

  if (game.phase === "playing") return <PlayScreen content={content} game={game} />;
  if (game.phase === "result") return <ResultScreen content={content} game={game} />;
  return <StartScreen content={content} game={game} />;
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
    <GameLayout gameId="deepfake" lesson={6} title="딥페이크 탐정단">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center text-sm text-muted-foreground">
          수사 본부의 문을 여는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

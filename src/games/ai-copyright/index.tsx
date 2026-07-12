/**
 * 15차시 · 누가 만들었게?
 * 플레이어는 누리마을 '창작 심판'이 되어, AI로 만든 작품을 쓸 때 옳은지 판단한다.
 * 핵심 가치: 책임 (충북형 AI 윤리 가이드라인 PART2 저작권, 세부원칙 8·9).
 * 핵심 배움: AI로 만든 것을 쓸 때의 책임 — 출처 밝히기, 남의 작품 함부로
 * 쓰지 않기, 대회에 낼 때 정직하기.
 * 콘텐츠(상황·선택지·원칙 도감)는 src/content/ai-copyright.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/ai-copyright.json";
import type { AcContent } from "./types";
import { useAiCopyrightGame } from "./useAiCopyrightGame";
import StartScreen from "./components/StartScreen";
import Part1Screen from "./components/Part1Screen";
import Part2Screen from "./components/Part2Screen";
import ResultScreen from "./components/ResultScreen";
import ExitGuard from "@/components/ExitGuard";
import "./styles.css";

function GameBody({ content }: { content: AcContent }) {
  const game = useAiCopyrightGame(content);

  if (game.phase === "part1")
    return (
      <>
        <ExitGuard />
        <Part1Screen content={content} game={game} />
      </>
    );
  if (game.phase === "part2")
    return (
      <>
        <ExitGuard />
        <Part2Screen content={content} game={game} />
      </>
    );
  if (game.phase === "result") return <ResultScreen content={content} game={game} />;
  return <StartScreen content={content} onStart={game.start} />;
}

export default function AiCopyrightGame() {
  const [content, setContent] = useState<AcContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<AcContent>("ai-copyright", fallbackContent as AcContent).then(
      (loaded) => {
        if (alive) setContent(loaded);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GameLayout gameId="ai-copyright" lesson={15} title="누가 만들었게?">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center text-sm text-muted-foreground">
          창작 심판대를 여는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

/**
 * 7차시 · 누리봇 사실 검증단
 * 플레이어는 '사실 확인 요원'이 되어, AI 비서 '누리봇'이 마을 사람들에게
 * 보낼 답변을 자료 서랍의 근거와 대조해 검증한다.
 * 핵심 배움: AI는 그럴듯한 거짓(환각)을 섞어 말할 수 있으니, 중요한 내용은
 * 꼭 다른 자료와 대조해 확인한다. AI는 악당이 아니라 확인이 필요한 도구다.
 * 콘텐츠(질문·답변·근거)는 src/content/fact-check.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/fact-check.json";
import type { FcContent } from "./types";
import { useFactCheckGame } from "./useFactCheckGame";
import StartScreen from "./components/StartScreen";
import PlayScreen from "./components/PlayScreen";
import ResultScreen from "./components/ResultScreen";
import "./styles.css";

function GameBody({ content }: { content: FcContent }) {
  const game = useFactCheckGame(content);

  if (game.phase === "playing") return <PlayScreen content={content} game={game} />;
  if (game.phase === "result") return <ResultScreen content={content} game={game} />;
  return <StartScreen content={content} onStart={game.start} />;
}

export default function FactCheckGame() {
  const [content, setContent] = useState<FcContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<FcContent>("fact-check", fallbackContent as FcContent).then((loaded) => {
      if (alive) setContent(loaded);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GameLayout gameId="fact-check" lesson={7} title="누리봇 사실 검증단">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center text-sm text-muted-foreground">
          자료 서랍을 여는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

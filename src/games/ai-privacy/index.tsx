/**
 * 13차시 · 누리봇에게 말해도 될까?
 * 플레이어는 AI 비서 '누리봇'에게 보낼 메시지를 검사하는 안전 요원이 되어,
 * 1부(보내도 될까?)에서는 개인정보가 담긴 메시지를 가려 막고,
 * 2부(실수했어요!)에서는 이미 입력해 버린 상황의 올바른 대응을 고른다.
 * 핵심 배움: 생성형 AI에게 개인정보·비밀을 입력하지 않기, 실수했을 때 대응하기.
 * (충북형 AI 윤리 가이드라인 PART1 개인정보 보호 · 세부원칙 1·2·3, 안전.)
 * 콘텐츠(메시지·위험 유형·실수 상황·수칙)는 src/content/ai-privacy.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/ai-privacy.json";
import type { ApContent } from "./types";
import { useAiPrivacyGame } from "./useAiPrivacyGame";
import StartScreen from "./components/StartScreen";
import Round1Screen from "./components/Round1Screen";
import MistakeScreen from "./components/MistakeScreen";
import ResultScreen from "./components/ResultScreen";
import "./styles.css";

function GameBody({ content }: { content: ApContent }) {
  const game = useAiPrivacyGame(content);

  if (game.phase === "round1") return <Round1Screen content={content} game={game} />;
  if (game.phase === "mistakes") return <MistakeScreen content={content} game={game} />;
  if (game.phase === "result") return <ResultScreen content={content} game={game} />;
  return <StartScreen content={content} onStart={game.start} />;
}

export default function AiPrivacyGame() {
  const [content, setContent] = useState<ApContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<ApContent>("ai-privacy", fallbackContent as unknown as ApContent).then(
      (loaded) => {
        if (alive) setContent(loaded);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GameLayout gameId="ai-privacy" lesson={13} title="누리봇에게 말해도 될까?">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center text-sm text-muted-foreground">
          누리봇을 부르는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

/**
 * 3차시 · 추천 요정 훈련소
 * 가상 SNS "반짝피드"의 추천 요정이 되어, 친구가 좋아요 누른 게시물을 보고
 * 다음에 추천할 게시물을 고르며 추천 알고리즘의 원리를 체험한다.
 * 콘텐츠(게시물·난이도·문구)는 src/content/social-insight.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/social-insight.json";
import type { SiContent } from "./types";
import { useSocialInsightGame } from "./useSocialInsightGame";
import StartScreen from "./components/StartScreen";
import PlayScreen from "./components/PlayScreen";
import ResultScreen from "./components/ResultScreen";
import "./styles.css";

function GameBody({ content }: { content: SiContent }) {
  const game = useSocialInsightGame(content);

  if (game.phase === "playing") return <PlayScreen content={content} game={game} />;
  if (game.phase === "result") return <ResultScreen content={content} game={game} />;
  return <StartScreen content={content} game={game} />;
}

export default function SocialInsightGame() {
  const [content, setContent] = useState<SiContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<SiContent>("social-insight", fallbackContent as SiContent).then(
      (loaded) => {
        if (alive) setContent(loaded);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GameLayout gameId="social-insight" lesson={3} title="추천 요정 훈련소">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center text-sm text-muted-foreground">
          훈련소 문을 여는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

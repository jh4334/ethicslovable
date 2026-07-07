import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/trend-tycoon.json";
import type { TrendTycoonContent } from "./types";
import Game from "./Game";
import "./styles.css";

const fallback = fallbackContent as TrendTycoonContent;

/** 외부 JSON 이 깨져 있으면 번들에 포함된 기본 콘텐츠로 되돌린다 */
function isValidContent(content: TrendTycoonContent | null | undefined): content is TrendTycoonContent {
  return Boolean(
    content &&
      content.intro &&
      Array.isArray(content.missions) &&
      content.missions.length > 0 &&
      Array.isArray(content.videos) &&
      content.videos.length > 0 &&
      Array.isArray(content.grades) &&
      content.grades.length > 0 &&
      content.clear
  );
}

/** 4차시 게임 "알고리즘 연구소장" (누리TV 알고리즘 연구소) 진입점 */
export default function TrendTycoonGame() {
  const [content, setContent] = useState<TrendTycoonContent | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadContent<TrendTycoonContent>("trend-tycoon", fallback).then((loaded) => {
      if (!cancelled) {
        setContent(isValidContent(loaded) ? loaded : fallback);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GameLayout gameId="trend-tycoon" lesson={4} title="알고리즘 연구소장">
      {content ? (
        <Game content={content} />
      ) : (
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground animate-fade-in">
          연구소를 준비하고 있어요…
        </div>
      )}
    </GameLayout>
  );
}

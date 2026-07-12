/**
 * 10차시 · 뽑기 상자의 비밀
 * 누리마을 지킴이가 게임 '전설의 수호자' 아이템 상점의 확률형 뽑기를
 * 조사한다. 직접 뽑아 보고(확률 비공개) → 확률을 공개해 계산하고 →
 * 계속 뽑게 만드는 장치 3가지를 해부하고 → 현명한 선택을 연습한다.
 * 핵심: "확률을 계산해 보면 속지 않는다" — 사행성 조장이 아니라 해부.
 * 콘텐츠(문구·확률·아이템)는 src/content/gacha-box.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/gacha-box.json";
import type { GbContent } from "./types";
import { useGachaGame } from "./useGachaGame";
import IntroScreen from "./components/IntroScreen";
import ShopScreen from "./components/ShopScreen";
import RevealScreen from "./components/RevealScreen";
import TricksScreen from "./components/TricksScreen";
import ScenarioScreen from "./components/ScenarioScreen";
import ResultScreen from "./components/ResultScreen";
import ExitGuard from "@/components/ExitGuard";
import "./styles.css";

function GameBody({ content }: { content: GbContent }) {
  const game = useGachaGame(content);

  if (game.phase === "shop")
    return (
      <>
        <ExitGuard />
        <ShopScreen content={content} game={game} />
      </>
    );
  if (game.phase === "reveal")
    return (
      <>
        <ExitGuard />
        <RevealScreen content={content} game={game} />
      </>
    );
  if (game.phase === "tricks")
    return (
      <>
        <ExitGuard />
        <TricksScreen content={content} game={game} />
      </>
    );
  if (game.phase === "scenario")
    return (
      <>
        <ExitGuard />
        <ScenarioScreen content={content} game={game} />
      </>
    );
  if (game.phase === "result") return <ResultScreen content={content} game={game} />;
  return <IntroScreen content={content} onStart={game.start} />;
}

export default function GachaBoxGame() {
  const [content, setContent] = useState<GbContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<GbContent>("gacha-box", fallbackContent as GbContent).then((loaded) => {
      if (alive) setContent(loaded);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GameLayout gameId="gacha-box" lesson={10} title="뽑기 상자의 비밀">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center text-sm text-muted-foreground">
          상점 문을 여는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

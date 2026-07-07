import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/feed-algorithm.json";
import IntroScreen from "./IntroScreen";
import PlayingScreen from "./PlayingScreen";
import ResultScreen from "./ResultScreen";
import ReflectionScreen from "./ReflectionScreen";
import { analyzePlayStyle, makeInitialStats } from "./logic";
import type { EndingInfo, FeedAlgorithmContent, GameLogEntry, Stats } from "./types";
import "./styles.css";

type Screen = "INTRO" | "PLAYING" | "RESULT" | "REFLECTION";

/** 7일 생존 시 플레이 성향에 맞는 엔딩 문구를 고른다. */
function survivalEnding(content: FeedAlgorithmContent, stats: Stats): EndingInfo {
  const style = content.playStyles[analyzePlayStyle(stats)];
  return {
    emoji: style.emoji,
    title: style.survivalTitle,
    desc: style.survivalDesc,
    survived: true,
  };
}

/** 화면 전환 상태 머신 — 인트로 → 플레이 → 결과 → 성찰 → (재시작) */
function AlgorithmGame({ content }: { content: FeedAlgorithmContent }) {
  const [screen, setScreen] = useState<Screen>("INTRO");
  const [day, setDay] = useState(1);
  const [log, setLog] = useState<GameLogEntry[]>([]);
  const [finalStats, setFinalStats] = useState<Stats>(() =>
    makeInitialStats(content.meta.startValue),
  );
  const [ending, setEnding] = useState<EndingInfo | null>(null);

  const handleStart = () => {
    setDay(1);
    setLog([]);
    setEnding(null);
    setScreen("PLAYING");
  };

  // 수치가 한계에 닿아 끝난 경우 — 엔딩을 상태에 저장해 결과 화면에 표시한다.
  const handleGameOver = (
    gameEnding: EndingInfo,
    survivedDays: number,
    gameLog: GameLogEntry[],
    stats: Stats,
  ) => {
    setEnding(gameEnding);
    setDay(survivedDays);
    setLog(gameLog);
    setFinalStats(stats);
    setScreen("RESULT");
  };

  // 7일을 모두 버틴 경우 — 성향별 생존 엔딩을 저장한다.
  const handleSuccess = (survivedDays: number, gameLog: GameLogEntry[], stats: Stats) => {
    setEnding(survivalEnding(content, stats));
    setDay(survivedDays);
    setLog(gameLog);
    setFinalStats(stats);
    setScreen("RESULT");
  };

  return (
    <div className="fa-stage">
      <div className="fa-frame">
        {screen === "INTRO" && <IntroScreen content={content} onStart={handleStart} />}

        {screen === "PLAYING" && (
          <PlayingScreen content={content} onGameOver={handleGameOver} onSuccess={handleSuccess} />
        )}

        {screen === "RESULT" && ending && (
          <ResultScreen
            content={content}
            ending={ending}
            day={day}
            stats={finalStats}
            log={log}
            onContinue={() => setScreen("REFLECTION")}
          />
        )}

        {screen === "REFLECTION" && (
          <ReflectionScreen content={content} onRestart={() => setScreen("INTRO")} />
        )}
      </div>
    </div>
  );
}

/** 게임 진입점 — 콘텐츠 JSON을 불러온 뒤 게임을 시작한다. */
export default function FeedAlgorithmGame() {
  const [content, setContent] = useState<FeedAlgorithmContent | null>(null);

  useEffect(() => {
    let active = true;
    loadContent<FeedAlgorithmContent>(
      "feed-algorithm",
      fallbackContent as FeedAlgorithmContent,
    ).then((loaded) => {
      if (active) setContent(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <GameLayout gameId="feed-algorithm" lesson={1} title="알고리즘 설계자">
      {content ? (
        <AlgorithmGame content={content} />
      ) : (
        <div className="fa-stage items-center">
          <p className="fa-dim animate-fade-in text-sm">게임 내용을 불러오는 중이에요…</p>
        </div>
      )}
    </GameLayout>
  );
}

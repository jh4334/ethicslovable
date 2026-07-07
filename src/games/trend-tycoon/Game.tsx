import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Heart, MousePointer, TrendingUp, Zap } from "lucide-react";
import type { RankedVideo, TrendTycoonContent, Weights } from "./types";
import { checkMission, isCleanTop5 } from "./missions";
import GameHeader from "./GameHeader";
import MissionCard from "./MissionCard";
import WeightSlider from "./WeightSlider";
import VideoCard from "./VideoCard";
import ClearScreen from "./ClearScreen";

/** 레벨 시작 시 기본 가중치 */
const DEFAULT_WEIGHTS: Weights = { clicks: 5, watchTime: 5, likes: 5, intensity: 1 };

/*
 * 레벨 점수 규칙 — 아이들에게 이렇게 설명해요:
 * 1) 기본 점수 1000점: 미션을 해결하면 누구나 받아요.
 * 2) 레벨 보너스 = 레벨 × 200점: 뒤 레벨일수록 어려우니까요.
 * 3) 효율 보너스 = 남은 조정 기회 × 50점 (레벨마다 조정 기회 10번):
 *    알고리즘을 잘 이해할수록 적은 슬라이더 조정으로 미션을 풀 수 있어요.
 *    10번을 넘겨도 감점은 없고 보너스만 0점이 돼요.
 * 4) 황금 밸런스 보너스(5레벨만) +500점: 미션을 풀면서 상위 5개에
 *    자극도 4 이상 영상이 하나도 없으면 '건강한 추천'을 만든 거예요.
 * → 총점 범위 8,000 ~ 11,000점. 등급표(S~D)는 콘텐츠 JSON에서 관리해요.
 */
const BASE_SCORE = 1000;
const LEVEL_BONUS = 200;
const ADJUST_LIMIT = 10;
const ADJUST_BONUS = 50;
const BALANCE_BONUS = 500;
const BALANCE_MISSION_ID = "golden-balance";

interface GameProps {
  content: TrendTycoonContent;
}

/** 누리TV 알고리즘 연구소 — 본 게임 화면 */
export default function Game({ content }: GameProps) {
  // 미션을 레벨 순서로 정렬해 둔다 (JSON 순서가 바뀌어도 안전)
  const missions = useMemo(
    () => [...content.missions].sort((a, b) => a.level - b.level),
    [content.missions]
  );

  const [levelIndex, setLevelIndex] = useState(0);
  const [showClearScreen, setShowClearScreen] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [levelScores, setLevelScores] = useState<number[]>([]);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  // 이번 레벨에서 슬라이더를 조작한(손을 뗀) 횟수 — 효율 보너스 계산용
  const [adjustCount, setAdjustCount] = useState(0);
  // 이번 레벨에서 슬라이더를 한 번이라도 움직였는가 — 즉시 클리어 방지용
  const [hasMoved, setHasMoved] = useState(false);
  // 마지막으로 확정(commit)된 가중치 — 값이 안 바뀐 클릭은 조정 횟수로 세지 않는다
  const committedWeights = useRef<Weights>(DEFAULT_WEIGHTS);

  const mission = missions[levelIndex];

  // 추천 점수 계산 + 정렬 (가중치가 바뀔 때마다 실시간으로 다시 순위 매김)
  const sortedVideos = useMemo<RankedVideo[]>(() => {
    return content.videos
      .map((video) => ({
        ...video,
        score:
          video.clicks * weights.clicks * 0.1 +
          video.watchTime * weights.watchTime +
          video.likes * weights.likes +
          video.intensity * weights.intensity * 100,
      }))
      .sort((a, b) => b.score - a.score);
  }, [content.videos, weights]);

  // 미션 판정 + 실시간 진행 상황 (다섯 레벨 모두)
  const missionStatus = useMemo(
    () => checkMission(mission.id, sortedVideos),
    [mission.id, sortedVideos]
  );

  /** 가중치 변경 (드래그 중 실시간) */
  const handleWeightChange = (key: keyof Weights) => (value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
    setHasMoved(true);
  };

  /** 가중치 확정(손을 뗌) — 실제로 값이 바뀌었을 때만 조정 1회로 센다 */
  const handleWeightCommit = (key: keyof Weights) => (value: number) => {
    if (committedWeights.current[key] !== value) {
      committedWeights.current = { ...committedWeights.current, [key]: value };
      setAdjustCount((count) => count + 1);
    }
  };

  const calculateLevelScore = () => {
    const remaining = Math.max(0, ADJUST_LIMIT - adjustCount);
    let score = BASE_SCORE + mission.level * LEVEL_BONUS + remaining * ADJUST_BONUS;
    if (mission.id === BALANCE_MISSION_ID && isCleanTop5(sortedVideos)) {
      score += BALANCE_BONUS;
    }
    return score;
  };

  const startLevelState = () => {
    setWeights(DEFAULT_WEIGHTS);
    setAdjustCount(0);
    setHasMoved(false);
    committedWeights.current = DEFAULT_WEIGHTS;
  };

  const handleNextLevel = () => {
    if (!missionStatus.complete || !hasMoved) return;
    const levelScore = calculateLevelScore();
    setLevelScores((prev) => [...prev, levelScore]);
    setTotalScore((prev) => prev + levelScore);

    if (levelIndex < missions.length - 1) {
      setLevelIndex((prev) => prev + 1);
      startLevelState();
    } else {
      setShowClearScreen(true);
    }
  };

  const handleReset = () => {
    setLevelIndex(0);
    setShowClearScreen(false);
    setTotalScore(0);
    setLevelScores([]);
    startLevelState();
  };

  if (showClearScreen) {
    return (
      <ClearScreen
        totalScore={totalScore}
        levelScores={levelScores}
        grades={content.grades}
        clear={content.clear}
        onReset={handleReset}
      />
    );
  }

  const remainingBonusChances = Math.max(0, ADJUST_LIMIT - adjustCount);

  return (
    <div className="flex flex-col bg-background text-foreground md:h-[calc(100vh-2.75rem)] md:overflow-hidden">
      <GameHeader
        labName={content.intro.labName}
        platformName={content.intro.platformName}
        level={mission.level}
        totalLevels={missions.length}
        score={totalScore}
      />

      <div className="flex flex-1 flex-col md:flex-row md:overflow-hidden">
        {/* 왼쪽: 미션 & 알고리즘 조정 패널 */}
        <aside className="z-10 flex w-full shrink-0 flex-col border-r border-border bg-card shadow-lg md:w-80 md:overflow-y-auto">
          <MissionCard
            mission={mission}
            status={missionStatus}
            hasMoved={hasMoved}
            isLastLevel={levelIndex === missions.length - 1}
            onNextLevel={handleNextLevel}
          />

          <div className="flex flex-col gap-5 p-4 md:p-5">
            <div className="mb-1">
              <h2 className="text-base font-bold text-foreground">{content.intro.controlsTitle}</h2>
              <p className="text-xs text-muted-foreground">{content.intro.controlsSubtitle}</p>
              {/* 효율 보너스 안내 */}
              <p className="mt-1.5 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                조정 {adjustCount}번 사용 · 남은 보너스 기회 <b className="text-foreground">{remainingBonusChances}번</b>
                <br />
                적게 조정해서 해결할수록 보너스 점수가 커져요!
              </p>
            </div>

            <div className="space-y-4">
              <WeightSlider
                icon={MousePointer}
                label="클릭수 (어그로)"
                value={weights.clicks}
                color="blue"
                onChange={handleWeightChange("clicks")}
                onCommit={handleWeightCommit("clicks")}
              />
              <WeightSlider
                icon={Clock}
                label="시청 시간 (유익함)"
                value={weights.watchTime}
                color="green"
                onChange={handleWeightChange("watchTime")}
                onCommit={handleWeightCommit("watchTime")}
              />
              <WeightSlider
                icon={Heart}
                label="좋아요 (인기)"
                value={weights.likes}
                color="pink"
                onChange={handleWeightChange("likes")}
                onCommit={handleWeightCommit("likes")}
              />
              <WeightSlider
                icon={Zap}
                label="자극도 (도파민)"
                value={weights.intensity}
                min={-5}
                max={10}
                color="purple"
                onChange={handleWeightChange("intensity")}
                onCommit={handleWeightCommit("intensity")}
                hint={{ left: "청정구역", right: "자극적" }}
              />
            </div>
          </div>
        </aside>

        {/* 오른쪽: 실시간 추천 피드 */}
        <main className="flex-1 bg-background p-4 md:overflow-y-auto md:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <TrendingUp className="text-primary" aria-hidden />
                <span>{content.intro.feedTitle}</span>
              </h2>
              <span className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                {content.intro.feedSortLabel}
              </span>
            </div>

            <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4" layout>
              <AnimatePresence mode="popLayout">
                {sortedVideos.map((video, index) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    rank={index + 1}
                    isHighlighted={missionStatus.complete && index < 3}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

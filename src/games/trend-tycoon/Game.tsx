import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Heart, Megaphone, MousePointer, Search, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AftermathContent, RankedVideo, TrendTycoonContent, Weights } from "./types";
import { checkMission, isCleanTop5 } from "./missions";
import GameHeader from "./GameHeader";
import MissionCard from "./MissionCard";
import WeightSlider from "./WeightSlider";
import VideoCard from "./VideoCard";
import AftermathPanel from "./AftermathPanel";
import ClearScreen from "./ClearScreen";
import ExitGuard from "@/components/ExitGuard";

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

/*
 * 실시간 민원 알림 기준 — 상위 5위 안에 자극도 4 이상 영상이
 * 2개 이상이면 학부모 민원 배너를 띄운다. (정보 제공용 —
 * 미션 조건·점수·클리어 가능 여부에는 아무 영향이 없다.)
 */
const COMPLAINT_INTENSITY = 4;
const COMPLAINT_THRESHOLD = 2;

/*
 * 피드 상단 카테고리 칩 — 동영상 앱 홈 화면처럼 보이게 하는 장식.
 * 클릭하면 눌린 표시(active)만 바뀌고, 피드 정렬·필터에는 아무 영향이 없다.
 * (피드는 언제나 알고리즘 점수 순 — 그게 이 게임의 학습 포인트)
 */
const FILTER_CHIPS = ["전체", "게임", "학습", "뉴스", "광고"] as const;

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
  // 미션 클리어 직후 보여 줄 "누리마을의 반응" (null 이면 오버레이 없음)
  const [pendingAftermath, setPendingAftermath] = useState<AftermathContent | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [levelScores, setLevelScores] = useState<number[]>([]);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  // 이번 레벨에서 슬라이더를 조작한(손을 뗀) 횟수 — 효율 보너스 계산용
  const [adjustCount, setAdjustCount] = useState(0);
  // 이번 레벨에서 슬라이더를 한 번이라도 움직였는가 — 즉시 클리어 방지용
  const [hasMoved, setHasMoved] = useState(false);
  // 마지막으로 확정(commit)된 가중치 — 값이 안 바뀐 클릭은 조정 횟수로 세지 않는다
  const committedWeights = useRef<Weights>(DEFAULT_WEIGHTS);
  // 피드 상단 카테고리 칩의 눌린 표시 (순수 장식 — 정렬·필터·점수와 무관)
  const [activeChip, setActiveChip] = useState<string>(FILTER_CHIPS[0]);

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

  // 실시간 민원 알림 — 상위 5위 중 자극도 4 이상 영상 수 (정보 제공용)
  const complaintCount = useMemo(
    () => sortedVideos.slice(0, 5).filter((v) => v.intensity >= COMPLAINT_INTENSITY).length,
    [sortedVideos]
  );
  const showComplaintBanner = complaintCount >= COMPLAINT_THRESHOLD;

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

  /** 다음 레벨 또는 최종 결과 화면으로 실제 이동 */
  const advanceLevel = () => {
    setPendingAftermath(null);
    if (levelIndex < missions.length - 1) {
      setLevelIndex((prev) => prev + 1);
      startLevelState();
    } else {
      setShowClearScreen(true);
    }
  };

  const handleNextLevel = () => {
    if (!missionStatus.complete || !hasMoved || pendingAftermath) return;
    const levelScore = calculateLevelScore();
    setLevelScores((prev) => [...prev, levelScore]);
    setTotalScore((prev) => prev + levelScore);

    // "누리마을의 반응"이 있으면 먼저 보여 주고, 없으면(교사가 지웠으면) 바로 이동
    const aftermath = mission.aftermath;
    if (aftermath && aftermath.headline && Array.isArray(aftermath.comments) && aftermath.comments.length > 0) {
      setPendingAftermath(aftermath);
    } else {
      advanceLevel();
    }
  };

  const handleReset = () => {
    setLevelIndex(0);
    setShowClearScreen(false);
    setPendingAftermath(null);
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
        finalReport={content.finalReport}
        onReset={handleReset}
      />
    );
  }

  const remainingBonusChances = Math.max(0, ADJUST_LIMIT - adjustCount);

  return (
    <div className="flex flex-col bg-background text-foreground md:h-[calc(100vh-2.75rem)] md:overflow-hidden">
      <ExitGuard />
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

          {/* 실시간 민원 알림 — 정보 제공용 배너 (미션·점수와 무관) */}
          <AnimatePresence initial={false}>
            {showComplaintBanner && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="tt-complaint-banner mx-4 mt-4 rounded-xl p-3 md:mx-5" role="status">
                  <div className="flex items-start gap-2 text-xs font-bold">
                    <Megaphone size={16} className="tt-complaint-icon mt-0.5 shrink-0" aria-hidden />
                    <span>학부모 민원 {complaintCount}건 접수! 자극적인 영상이 추천 맨 위에 있어요</span>
                  </div>
                  <p className="tt-complaint-caption mt-1.5 pl-6 text-[11px]">
                    알고리즘이 자극적인 것만 올리면 민원이 늘어나요
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-5 p-4 md:p-5">
            <div className="mb-1">
              <h2 className="text-base font-extrabold text-foreground">{content.intro.controlsTitle}</h2>
              <p className="text-xs text-muted-foreground">{content.intro.controlsSubtitle}</p>
              {/* 효율 보너스 안내 */}
              <p className="mt-2 rounded-xl border border-border bg-muted/60 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground">
                조정 {adjustCount}번 사용 · 남은 보너스 기회 <b className="tt-bonus-chip text-[11px]">{remainingBonusChances}번</b>
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
            {/* 피드 상단 — 동영상 앱 홈 화면 문법: 제목 + 검색창 + 카테고리 칩 행 */}
            <div className="mb-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
                  <TrendingUp className="text-primary" aria-hidden />
                  <span>{content.intro.feedTitle}</span>
                </h2>
                <span className="mlq-chip border border-border bg-card text-muted-foreground shadow-soft">
                  {content.intro.feedSortLabel}
                </span>
              </div>

              {/* 검색창 모양 장식 — 진짜 검색 기능은 없다 (꾸며진 화면) */}
              <div className="tt-search-bar flex items-center gap-2.5 rounded-full px-4 py-2" aria-hidden="true">
                <Search size={16} className="shrink-0" />
                <span className="truncate text-sm">누리TV 검색 — 꾸며진 화면이에요</span>
              </div>

              {/* 카테고리 칩 행 — 눌린 표시만 바뀌는 장식 (정렬·필터 없음) */}
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {FILTER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setActiveChip(chip)}
                    aria-pressed={activeChip === chip}
                    className={cn("tt-filter-chip", activeChip === chip && "tt-filter-chip-active")}
                  >
                    {chip}
                  </button>
                ))}
              </div>
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

      {/* 미션 클리어 후 "누리마을의 반응" 오버레이 */}
      {pendingAftermath && (
        <AftermathPanel
          aftermath={pendingAftermath}
          isLastLevel={levelIndex === missions.length - 1}
          onProceed={advanceLevel}
        />
      )}
    </div>
  );
}

/**
 * 모두의 AI — 게임 상태 훅.
 * 화면 흐름: intro → inspect(6명) → fix(4문제) → result
 * 모든 판정은 순수하게 setState로만 처리한다. 부수효과가 없어 StrictMode-safe.
 */
import { useCallback, useMemo, useState } from "react";
import type {
  AfContent,
  AfFix,
  AfGrade,
  AfPhase,
  AfUser,
  FixResult,
  InspectResult,
} from "./types";

/** 검사(inspect) 단계의 세부 진행 */
export type InspectStep = "ask" | "cause" | "revealed";

export interface AiFairGame {
  phase: AfPhase;

  /* ---- 1부 · 공정 시험 ---- */
  userIndex: number;
  currentUser: AfUser;
  inspectStep: InspectStep;
  /** 이번 사용자에 대해 플레이어가 고른 판단 (null=아직) */
  judgedFair: boolean | null;
  /** 이번 사용자에 대해 고른 원인 카드 id (null=아직) */
  causePicked: string | null;
  inspectResults: InspectResult[];
  judgeUser: (fair: boolean) => void;
  pickCause: (causeId: string) => void;
  nextUser: () => void;

  /* ---- 2부 · 공정하게 고치기 ---- */
  fixIndex: number;
  currentFix: AfFix;
  /** 이번 문제에서 고른 선택지 인덱스들 (오답 재시도 추적) */
  fixPicked: number[];
  /** 이번 문제를 풀었는가 */
  fixSolved: boolean;
  fixResults: FixResult[];
  pickFix: (choiceIndex: number) => void;
  nextFix: () => void;

  /* ---- 점수 ---- */
  judgeScore: number;
  causeScore: number;
  fixScore: number;
  fairnessScore: number;
  grade: AfGrade;
  /** 도감에 담은 (정답으로 맞힌) 차별 유형 id 목록 */
  collectedCauseIds: string[];
  badgeCount: number;

  /* ---- 흐름 ---- */
  start: () => void;
  restart: () => void;
}

const MAX_JUDGE = 6; // 사용자 판단 최대 점수(사용자 수로 대체됨)
const MAX_CAUSE = 5; // 불공평 사용자 수로 대체됨
const MAX_FIX = 4; // 고치기 문제 수로 대체됨

function pickGrade(grades: AfGrade[], score: number): AfGrade {
  // min 이 큰 순서로 정렬해 두고 처음 만족하는 등급을 고른다.
  const sorted = [...grades].sort((a, b) => b.min - a.min);
  return sorted.find((g) => score >= g.min) ?? sorted[sorted.length - 1];
}

export function useAiFairGame(content: AfContent): AiFairGame {
  const [phase, setPhase] = useState<AfPhase>("intro");

  // 1부 상태
  const [userIndex, setUserIndex] = useState(0);
  const [judgedFair, setJudgedFair] = useState<boolean | null>(null);
  const [causePicked, setCausePicked] = useState<string | null>(null);
  const [inspectResults, setInspectResults] = useState<InspectResult[]>([]);

  // 2부 상태
  const [fixIndex, setFixIndex] = useState(0);
  const [fixPicked, setFixPicked] = useState<number[]>([]);
  const [fixSolved, setFixSolved] = useState(false);
  const [fixResults, setFixResults] = useState<FixResult[]>([]);

  const users = content.users;
  const fixes = content.fixes;
  const currentUser = users[Math.min(userIndex, users.length - 1)];
  const currentFix = fixes[Math.min(fixIndex, fixes.length - 1)];

  // 검사 세부 단계 파생
  const inspectStep: InspectStep = useMemo(() => {
    if (judgedFair === null) return "ask";
    // 불공평한 사용자는 원인을 고르기 전까지 cause 단계
    if (!currentUser.isFair && causePicked === null) return "cause";
    return "revealed";
  }, [judgedFair, causePicked, currentUser.isFair]);

  const start = useCallback(() => setPhase("inspect"), []);

  const judgeUser = useCallback((fair: boolean) => {
    setJudgedFair((prev) => (prev === null ? fair : prev));
  }, []);

  const pickCause = useCallback((causeId: string) => {
    setCausePicked((prev) => (prev === null ? causeId : prev));
  }, []);

  const nextUser = useCallback(() => {
    // 현재 사용자 결과를 확정해 누적한다.
    const judged = judgedFair ?? false;
    const judgeCorrect = judged === currentUser.isFair;
    const causeCorrect =
      !currentUser.isFair &&
      causePicked !== null &&
      causePicked === currentUser.causeId;
    const result: InspectResult = {
      userId: currentUser.id,
      judgedFair: judged,
      judgeCorrect,
      causePicked,
      causeCorrect,
    };
    setInspectResults((prev) => {
      // 같은 사용자 중복 누적 방지 (StrictMode/더블클릭 안전)
      if (prev.some((r) => r.userId === result.userId)) return prev;
      return [...prev, result];
    });
    setJudgedFair(null);
    setCausePicked(null);
    if (userIndex + 1 < users.length) {
      setUserIndex(userIndex + 1);
    } else {
      setPhase("fix");
    }
  }, [judgedFair, causePicked, currentUser, userIndex, users.length]);

  const pickFix = useCallback(
    (choiceIndex: number) => {
      if (fixSolved) return;
      const choice = currentFix.choices[choiceIndex];
      if (!choice) return;
      setFixPicked((prev) => {
        if (prev.includes(choiceIndex)) return prev;
        const next = [...prev, choiceIndex];
        if (choice.isGood) {
          const firstTry = prev.length === 0;
          setFixSolved(true);
          setFixResults((rs) => {
            if (rs.some((r) => r.fixId === currentFix.id)) return rs;
            return [...rs, { fixId: currentFix.id, firstTrySolved: firstTry }];
          });
        }
        return next;
      });
    },
    [fixSolved, currentFix],
  );

  const nextFix = useCallback(() => {
    setFixPicked([]);
    setFixSolved(false);
    if (fixIndex + 1 < fixes.length) {
      setFixIndex(fixIndex + 1);
    } else {
      setPhase("result");
    }
  }, [fixIndex, fixes.length]);

  const restart = useCallback(() => {
    setPhase("intro");
    setUserIndex(0);
    setJudgedFair(null);
    setCausePicked(null);
    setInspectResults([]);
    setFixIndex(0);
    setFixPicked([]);
    setFixSolved(false);
    setFixResults([]);
  }, []);

  // 점수 계산
  const judgeScore = inspectResults.filter((r) => r.judgeCorrect).length;
  const causeScore = inspectResults.filter((r) => r.causeCorrect).length;
  const fixScore = fixResults.filter((r) => r.firstTrySolved).length;
  const badgeCount = fixResults.length;
  const collectedCauseIds = inspectResults
    .filter((r) => r.causeCorrect && r.causePicked)
    .map((r) => r.causePicked as string);

  const maxJudge = users.length || MAX_JUDGE;
  const maxCause = users.filter((u) => !u.isFair).length || MAX_CAUSE;
  const maxFix = fixes.length || MAX_FIX;
  const totalMax = maxJudge + maxCause + maxFix;
  const fairnessScore =
    totalMax > 0
      ? Math.round(((judgeScore + causeScore + fixScore) / totalMax) * 100)
      : 0;
  const grade = pickGrade(content.grades, fairnessScore);

  return {
    phase,
    userIndex,
    currentUser,
    inspectStep,
    judgedFair,
    causePicked,
    inspectResults,
    judgeUser,
    pickCause,
    nextUser,
    fixIndex,
    currentFix,
    fixPicked,
    fixSolved,
    fixResults,
    pickFix,
    nextFix,
    judgeScore,
    causeScore,
    fixScore,
    fairnessScore,
    grade,
    collectedCauseIds,
    badgeCount,
    start,
    restart,
  };
}

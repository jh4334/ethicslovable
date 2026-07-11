/**
 * 누가 만들었게? — 게임 상태 관리 훅.
 * 1부(상황 판별 6) → 2부(바르게 만들기 3) → 결과 로 진행한다.
 * 판정은 answeredRef / pickedGoodRef 가드로 중복 제출을 막아
 * StrictMode 이중 호출에도 점수가 두 번 오르지 않는다.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import type {
  AcContent,
  AcMakeRightPick,
  AcRound1,
  AcRound1Verdict,
  AcVerdictKey,
  Phase,
} from "./types";

export interface AiCopyrightGame {
  phase: Phase;
  /** 1부 진행 인덱스 */
  r1Index: number;
  round1: AcRound1;
  totalRound1: number;
  /** 2부 진행 인덱스 */
  mrIndex: number;
  totalMakeRight: number;
  score: number;
  /** 1부에서 바르게 판단한 횟수 */
  correctCount: number;
  /** 지금까지 도감에 모은 원칙 id */
  collectedPrincipleIds: string[];
  /** 이번 1부 상황의 판정 (null이면 아직 판정 전) */
  r1Verdict: AcRound1Verdict | null;
  /** 이번 2부 상황에서 고른 선택 (null이면 아직 선택 전) */
  mrPick: AcMakeRightPick | null;
  isLastRound1: boolean;
  isLastMakeRight: boolean;
  start: () => void;
  /** 1부 판단 제출 */
  chooseRound1: (key: AcVerdictKey) => void;
  /** 1부 다음 상황(또는 2부로) */
  nextRound1: () => void;
  /** 2부 선택 */
  chooseMakeRight: (choiceIndex: number) => void;
  /** 2부 다음 상황(또는 결과로) */
  nextMakeRight: () => void;
  restart: () => void;
}

export function useAiCopyrightGame(content: AcContent): AiCopyrightGame {
  const round1s = content.round1;
  const makeRights = content.makeRight;
  const totalRound1 = round1s.length;
  const totalMakeRight = makeRights.length;
  const pointsPerCorrect = content.rules?.pointsPerCorrect ?? 10;

  const [phase, setPhase] = useState<Phase>("start");
  const [r1Index, setR1Index] = useState(0);
  const [mrIndex, setMrIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [collectedPrincipleIds, setCollectedPrincipleIds] = useState<string[]>([]);
  const [r1Verdict, setR1Verdict] = useState<AcRound1Verdict | null>(null);
  const [mrPick, setMrPick] = useState<AcMakeRightPick | null>(null);

  // 이벤트 핸들러에서만 바꾸는 중복 제출 가드 — setState 업데이터 안에서
  // 부수효과를 내지 않으므로 StrictMode 이중 호출에도 점수가 두 번 오르지 않는다.
  const r1AnsweredRef = useRef(false);
  // 2부: 이 상황에서 이미 '정답'을 골랐는지 (정답 점수는 한 번만)
  const mrScoredRef = useRef(false);

  const round1 = round1s[Math.min(r1Index, totalRound1 - 1)];
  const isLastRound1 = r1Index >= totalRound1 - 1;
  const isLastMakeRight = mrIndex >= totalMakeRight - 1;

  const start = useCallback(() => {
    setPhase("part1");
    setR1Index(0);
    setMrIndex(0);
    setScore(0);
    setCorrectCount(0);
    setCollectedPrincipleIds([]);
    setR1Verdict(null);
    setMrPick(null);
    r1AnsweredRef.current = false;
    mrScoredRef.current = false;
  }, []);

  const chooseRound1 = useCallback(
    (key: AcVerdictKey) => {
      if (r1AnsweredRef.current) return;
      r1AnsweredRef.current = true;
      const correct = key === round1.correct;
      if (correct) {
        setScore((s) => s + pointsPerCorrect);
        setCorrectCount((c) => c + 1);
        setCollectedPrincipleIds((prev) =>
          prev.includes(round1.focusPrincipleId)
            ? prev
            : [...prev, round1.focusPrincipleId],
        );
      }
      setR1Verdict({ correct, pickedKey: key });
    },
    [round1, pointsPerCorrect],
  );

  const nextRound1 = useCallback(() => {
    if (r1Index >= totalRound1 - 1) {
      setPhase("part2");
      setMrIndex(0);
      setMrPick(null);
      mrScoredRef.current = false;
      return;
    }
    setR1Index((i) => i + 1);
    setR1Verdict(null);
    r1AnsweredRef.current = false;
  }, [r1Index, totalRound1]);

  const chooseMakeRight = useCallback(
    (choiceIndex: number) => {
      const choice = makeRights[mrIndex]?.choices[choiceIndex];
      if (!choice) return;
      // 바른 선택(정답)을 이미 골랐다면 더 이상 바꾸지 않는다.
      if (mrScoredRef.current) return;
      if (choice.isGood && !mrScoredRef.current) {
        mrScoredRef.current = true;
        setScore((s) => s + pointsPerCorrect);
      }
      setMrPick({ choiceIndex, isGood: choice.isGood });
    },
    [makeRights, mrIndex, pointsPerCorrect],
  );

  const nextMakeRight = useCallback(() => {
    if (mrIndex >= totalMakeRight - 1) {
      setPhase("result");
      return;
    }
    setMrIndex((i) => i + 1);
    setMrPick(null);
    mrScoredRef.current = false;
  }, [mrIndex, totalMakeRight]);

  const restart = useCallback(() => {
    setPhase("start");
    setR1Index(0);
    setMrIndex(0);
    setScore(0);
    setCorrectCount(0);
    setCollectedPrincipleIds([]);
    setR1Verdict(null);
    setMrPick(null);
    r1AnsweredRef.current = false;
    mrScoredRef.current = false;
  }, []);

  return useMemo(
    () => ({
      phase,
      r1Index,
      round1,
      totalRound1,
      mrIndex,
      totalMakeRight,
      score,
      correctCount,
      collectedPrincipleIds,
      r1Verdict,
      mrPick,
      isLastRound1,
      isLastMakeRight,
      start,
      chooseRound1,
      nextRound1,
      chooseMakeRight,
      nextMakeRight,
      restart,
    }),
    [
      phase,
      r1Index,
      round1,
      totalRound1,
      mrIndex,
      totalMakeRight,
      score,
      correctCount,
      collectedPrincipleIds,
      r1Verdict,
      mrPick,
      isLastRound1,
      isLastMakeRight,
      start,
      chooseRound1,
      nextRound1,
      chooseMakeRight,
      nextMakeRight,
      restart,
    ],
  );
}

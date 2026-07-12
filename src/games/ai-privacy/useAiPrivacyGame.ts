/**
 * 누리봇에게 말해도 될까? — 게임 상태 관리 훅.
 * 1부(보내도 될까? · 보내기 OK/멈춰 판단)와 2부(실수했어요 · 올바른 대응 고르기)를
 * 같은 "질문 → 판단 → 해설" 리듬으로 진행한다.
 *
 * StrictMode 안전: 순차 애니메이션 타이머를 쓰지 않고, 모든 진행은
 * 명시적인 사용자 클릭(judge/next/choose)으로만 상태를 전진시킨다.
 * (이펙트가 두 번 실행돼도 부작용이 없다.)
 */
import { useCallback, useMemo, useState } from "react";
import type { ApContent, ApPhase, ApStage, ApVerdict } from "./types";

export interface AiPrivacyGame {
  phase: ApPhase;

  /** 1부 진행 인덱스 */
  r1Index: number;
  r1Stage: ApStage;
  /** 라운드별 플레이어의 판단 (아직이면 null) */
  r1Verdicts: (ApVerdict | null)[];

  /** 2부 진행 인덱스 */
  mIndex: number;
  mStage: ApStage;
  /** 상황별 고른 선택지 인덱스 (아직이면 null) */
  mAnswers: (number | null)[];

  /** 1부에서 옳게 판단한 라운드 수 */
  r1Correct: number;
  /** 위험 메시지를 옳게 '멈춰'로 막아 도감에 모은 개인정보 유형 id들 */
  collectedTypeIds: string[];
  /** 2부에서 올바른 대응을 고른 수 */
  mCorrect: number;
  /** 총 정답 수 = 안전 점수의 바탕 */
  totalCorrect: number;
  /** 총 문항 수 (1부 + 2부) */
  totalQuestions: number;

  start: () => void;
  judge: (verdict: ApVerdict) => void;
  nextRound: () => void;
  chooseMistake: (choiceIndex: number) => void;
  nextMistake: () => void;
  restart: () => void;
}

export function useAiPrivacyGame(content: ApContent): AiPrivacyGame {
  const rounds = content.round1;
  const mistakes = content.mistakes;

  const [phase, setPhase] = useState<ApPhase>("start");

  const [r1Index, setR1Index] = useState(0);
  const [r1Stage, setR1Stage] = useState<ApStage>("ask");
  const [r1Verdicts, setR1Verdicts] = useState<(ApVerdict | null)[]>(() =>
    rounds.map(() => null),
  );

  const [mIndex, setMIndex] = useState(0);
  const [mStage, setMStage] = useState<ApStage>("ask");
  const [mAnswers, setMAnswers] = useState<(number | null)[]>(() =>
    mistakes.map(() => null),
  );

  const resetAll = useCallback(() => {
    setR1Index(0);
    setR1Stage("ask");
    setR1Verdicts(rounds.map(() => null));
    setMIndex(0);
    setMStage("ask");
    setMAnswers(mistakes.map(() => null));
  }, [rounds, mistakes]);

  const start = useCallback(() => {
    resetAll();
    setPhase("round1");
  }, [resetAll]);

  const restart = useCallback(() => {
    resetAll();
    setPhase("start");
  }, [resetAll]);

  const judge = useCallback(
    (verdict: ApVerdict) => {
      if (r1Stage !== "ask") return; // 중복 클릭 방지
      setR1Verdicts((prev) => {
        const next = [...prev];
        next[r1Index] = verdict;
        return next;
      });
      setR1Stage("reveal");
    },
    [r1Stage, r1Index],
  );

  const nextRound = useCallback(() => {
    if (r1Stage !== "reveal") return;
    if (r1Index >= rounds.length - 1) {
      setPhase("mistakes");
      return;
    }
    setR1Index((i) => i + 1);
    setR1Stage("ask");
  }, [r1Stage, r1Index, rounds.length]);

  const chooseMistake = useCallback(
    (choiceIndex: number) => {
      if (mStage !== "ask") return;
      setMAnswers((prev) => {
        const next = [...prev];
        next[mIndex] = choiceIndex;
        return next;
      });
      setMStage("reveal");
    },
    [mStage, mIndex],
  );

  const nextMistake = useCallback(() => {
    if (mStage !== "reveal") return;
    if (mIndex >= mistakes.length - 1) {
      setPhase("result");
      return;
    }
    setMIndex((i) => i + 1);
    setMStage("ask");
  }, [mStage, mIndex, mistakes.length]);

  const r1Correct = useMemo(
    () =>
      r1Verdicts.reduce((sum, v, i) => {
        if (v == null) return sum;
        const ok = v === "send" ? rounds[i].safe : !rounds[i].safe;
        return sum + (ok ? 1 : 0);
      }, 0),
    [r1Verdicts, rounds],
  );

  const collectedTypeIds = useMemo(() => {
    const set = new Set<string>();
    r1Verdicts.forEach((v, i) => {
      const r = rounds[i];
      if (v === "stop" && !r.safe && r.dangerTypeId) set.add(r.dangerTypeId);
    });
    return Array.from(set);
  }, [r1Verdicts, rounds]);

  const mCorrect = useMemo(
    () =>
      mAnswers.reduce<number>((sum, a, i) => {
        if (a == null) return sum;
        return sum + (mistakes[i].choices[a]?.isGood ? 1 : 0);
      }, 0),
    [mAnswers, mistakes],
  );

  const totalCorrect = r1Correct + mCorrect;
  const totalQuestions = rounds.length + mistakes.length;

  return useMemo(
    () => ({
      phase,
      r1Index,
      r1Stage,
      r1Verdicts,
      mIndex,
      mStage,
      mAnswers,
      r1Correct,
      collectedTypeIds,
      mCorrect,
      totalCorrect,
      totalQuestions,
      start,
      judge,
      nextRound,
      chooseMistake,
      nextMistake,
      restart,
    }),
    [
      phase,
      r1Index,
      r1Stage,
      r1Verdicts,
      mIndex,
      mStage,
      mAnswers,
      r1Correct,
      collectedTypeIds,
      mCorrect,
      totalCorrect,
      totalQuestions,
      start,
      judge,
      nextRound,
      chooseMistake,
      nextMistake,
      restart,
    ],
  );
}

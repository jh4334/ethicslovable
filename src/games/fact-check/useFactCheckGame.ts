/**
 * 누리봇 사실 검증단 — 게임 상태 관리 훅.
 * 라운드 진행, 검증 판정, 점수 계산을 담당한다.
 * 콘텐츠는 index.tsx에서 로드해 넘겨준다.
 */
import { useCallback, useMemo, useState } from "react";
import type { FcContent, FcRound, Phase, RoundVerdict } from "./types";

export interface FactCheckGame {
  phase: Phase;
  roundIndex: number;
  round: FcRound;
  totalRounds: number;
  score: number;
  correctCount: number;
  /** 이번 라운드 판정 (null이면 아직 검증 전) */
  verdict: RoundVerdict | null;
  /** 마지막 라운드까지 판정했는지 */
  isLastRound: boolean;
  start: () => void;
  /** index를 고르면 그 문장을 거짓으로, null이면 '모두 사실'로 검증 */
  verify: (pickedIndex: number | null) => void;
  next: () => void;
  restart: () => void;
}

export function useFactCheckGame(content: FcContent): FactCheckGame {
  const rounds = content.rounds;
  const totalRounds = rounds.length;
  const pointsPerCorrect = content.rules?.pointsPerCorrect ?? 10;

  const [phase, setPhase] = useState<Phase>("start");
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [verdict, setVerdict] = useState<RoundVerdict | null>(null);

  const round = rounds[Math.min(roundIndex, totalRounds - 1)];
  const isLastRound = roundIndex >= totalRounds - 1;

  const start = useCallback(() => {
    setPhase("playing");
    setRoundIndex(0);
    setScore(0);
    setCorrectCount(0);
    setVerdict(null);
  }, []);

  const verify = useCallback(
    (pickedIndex: number | null) => {
      // 이미 판정한 라운드면 무시 (중복 클릭 방지)
      setVerdict((prev) => {
        if (prev) return prev;
        const falseIndex = round.sentences.findIndex((s) => s.isFalse);
        const correct =
          pickedIndex === null ? falseIndex === -1 : pickedIndex === falseIndex;
        if (correct) {
          setScore((s) => s + pointsPerCorrect);
          setCorrectCount((c) => c + 1);
        }
        return { pickedIndex, correct, falseIndex };
      });
    },
    [round, pointsPerCorrect],
  );

  const next = useCallback(() => {
    if (roundIndex >= totalRounds - 1) {
      setPhase("result");
      return;
    }
    setRoundIndex((i) => i + 1);
    setVerdict(null);
  }, [roundIndex, totalRounds]);

  const restart = useCallback(() => {
    setPhase("start");
    setRoundIndex(0);
    setScore(0);
    setCorrectCount(0);
    setVerdict(null);
  }, []);

  return useMemo(
    () => ({
      phase,
      roundIndex,
      round,
      totalRounds,
      score,
      correctCount,
      verdict,
      isLastRound,
      start,
      verify,
      next,
      restart,
    }),
    [
      phase,
      roundIndex,
      round,
      totalRounds,
      score,
      correctCount,
      verdict,
      isLastRound,
      start,
      verify,
      next,
      restart,
    ],
  );
}

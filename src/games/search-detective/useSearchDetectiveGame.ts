/**
 * 검색 결과 탐정 — 게임 상태 관리 훅.
 * 라운드 진행, 질문 유형별 판정, 점수·단서 도감 수집을 담당한다.
 * 판정은 answeredRef로 중복 제출을 막아 StrictMode에서도 안전하다.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import type { Phase, SdContent, SdRound, SdVerdict } from "./types";

/** 질문 유형별 정답 결과 id 목록 */
function correctIdsFor(round: SdRound): string[] {
  switch (round.questionType) {
    case "find-ads":
      return round.results.filter((r) => r.type === "ad").map((r) => r.id);
    case "pick-trusted":
      return round.results.filter((r) => r.type === "official").map((r) => r.id);
    case "find-sponsor":
      return round.results.filter((r) => r.type === "sponsor").map((r) => r.id);
  }
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((x) => set.has(x));
}

export interface SearchDetectiveGame {
  phase: Phase;
  roundIndex: number;
  round: SdRound;
  totalRounds: number;
  score: number;
  correctCount: number;
  /** 이번 라운드 판정 (null이면 아직 판정 전) */
  verdict: SdVerdict | null;
  /** find-ads/pick-trusted에서 현재 골라 둔 결과 id */
  selectedIds: string[];
  /** 지금까지 도감에 수집한 단서 id */
  collectedClueIds: string[];
  isLastRound: boolean;
  start: () => void;
  /** 결과 선택 토글 — find-ads는 여러 개, pick-trusted는 한 개만 */
  toggleSelect: (resultId: string) => void;
  /** find-ads / pick-trusted 판정 제출 */
  submitSelection: () => void;
  /** find-sponsor 판정 제출 — 상세에서 탭한 문장으로 판정 */
  submitSponsorLine: (resultId: string, lineIndex: number) => void;
  next: () => void;
  restart: () => void;
}

export function useSearchDetectiveGame(content: SdContent): SearchDetectiveGame {
  const rounds = content.rounds;
  const totalRounds = rounds.length;
  const pointsPerCorrect = content.rules?.pointsPerCorrect ?? 10;

  const [phase, setPhase] = useState<Phase>("start");
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<SdVerdict | null>(null);
  const [collectedClueIds, setCollectedClueIds] = useState<string[]>([]);

  // 이벤트 핸들러에서만 바꾸는 중복 제출 가드 — setState 업데이터 안에서
  // 부수효과를 내지 않으므로 StrictMode 이중 호출에도 점수가 두 번 오르지 않는다.
  const answeredRef = useRef(false);

  const round = rounds[Math.min(roundIndex, totalRounds - 1)];
  const isLastRound = roundIndex >= totalRounds - 1;

  const resetRoundState = useCallback(() => {
    answeredRef.current = false;
    setSelectedIds([]);
    setVerdict(null);
  }, []);

  const start = useCallback(() => {
    setPhase("playing");
    setRoundIndex(0);
    setScore(0);
    setCorrectCount(0);
    setCollectedClueIds([]);
    resetRoundState();
  }, [resetRoundState]);

  const toggleSelect = useCallback(
    (resultId: string) => {
      if (answeredRef.current) return;
      setSelectedIds((prev) => {
        if (round.questionType === "pick-trusted") {
          return prev.includes(resultId) ? [] : [resultId];
        }
        return prev.includes(resultId)
          ? prev.filter((id) => id !== resultId)
          : [...prev, resultId];
      });
    },
    [round.questionType],
  );

  /** 공통 판정 마무리 — 점수·단서 수집·판정 기록 */
  const finalize = useCallback(
    (
      pickedIds: string[],
      correct: boolean,
      pickedLine: SdVerdict["pickedLine"],
    ) => {
      if (answeredRef.current) return;
      answeredRef.current = true;
      if (correct) {
        setScore((s) => s + pointsPerCorrect);
        setCorrectCount((c) => c + 1);
        // 맞힌 라운드의 대표 단서를 도감에 수집한다
        setCollectedClueIds((prev) =>
          prev.includes(round.focusClueId) ? prev : [...prev, round.focusClueId],
        );
      }
      setVerdict({
        correct,
        pickedIds,
        correctIds: correctIdsFor(round),
        pickedLine,
      });
    },
    [round, pointsPerCorrect],
  );

  const submitSelection = useCallback(() => {
    if (selectedIds.length === 0) return;
    const correctIds = correctIdsFor(round);
    const correct =
      round.questionType === "find-ads"
        ? sameSet(selectedIds, correctIds)
        : selectedIds.length === 1 && correctIds.includes(selectedIds[0]);
    finalize(selectedIds, correct, null);
  }, [round, selectedIds, finalize]);

  const submitSponsorLine = useCallback(
    (resultId: string, lineIndex: number) => {
      const sponsor = round.results.find((r) => r.type === "sponsor");
      const correct =
        !!sponsor &&
        resultId === sponsor.id &&
        lineIndex === sponsor.sponsorTextIndex;
      finalize([resultId], correct, { resultId, lineIndex });
    },
    [round, finalize],
  );

  const next = useCallback(() => {
    if (roundIndex >= totalRounds - 1) {
      setPhase("result");
      return;
    }
    setRoundIndex((i) => i + 1);
    resetRoundState();
  }, [roundIndex, totalRounds, resetRoundState]);

  const restart = useCallback(() => {
    setPhase("start");
    setRoundIndex(0);
    setScore(0);
    setCorrectCount(0);
    setCollectedClueIds([]);
    resetRoundState();
  }, [resetRoundState]);

  return useMemo(
    () => ({
      phase,
      roundIndex,
      round,
      totalRounds,
      score,
      correctCount,
      verdict,
      selectedIds,
      collectedClueIds,
      isLastRound,
      start,
      toggleSelect,
      submitSelection,
      submitSponsorLine,
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
      selectedIds,
      collectedClueIds,
      isLastRound,
      start,
      toggleSelect,
      submitSelection,
      submitSponsorLine,
      next,
      restart,
    ],
  );
}

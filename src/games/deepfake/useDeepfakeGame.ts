/**
 * 딥페이크 탐정단 — 게임 상태 훅.
 *
 * 한 사건(라운드)은 판별(judge) → 단서 찾기(hunt) → 해설(explain) 순서로
 * 진행된다. 단서 찾기는 "가짜"를 맞혔을 때만 열리고, 기회는 한 번이다.
 * 찾은 단서는 종류별로 단서 수첩(collectedClueIds)에 쌓인다.
 *
 * React.StrictMode(개발 모드에서 렌더·이펙트 2회 실행)에서도 안전하도록
 * 모든 상태 전환은 순수한 setState 로만 처리한다.
 */
import { useCallback, useMemo, useState } from "react";
import type {
  DfContent,
  DfHuntResult,
  DfJudgeResult,
  DfPhase,
  DfRound,
  DfStep,
} from "./types";

interface RoundState {
  step: DfStep;
  judge: DfJudgeResult | null;
  hunt: DfHuntResult | null;
  /** 사진에서 실제로 찾아낸 이상한 곳 id (하이라이트용) */
  foundAnomalyId: string | null;
  /** 글에서 고른 문장 번호 */
  pickedSentence: number | null;
}

const FRESH_ROUND: RoundState = {
  step: "judge",
  judge: null,
  hunt: null,
  foundAnomalyId: null,
  pickedSentence: null,
};

export function useDeepfakeGame(content: DfContent) {
  const [phase, setPhase] = useState<DfPhase>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundState, setRoundState] = useState<RoundState>(FRESH_ROUND);
  const [score, setScore] = useState(0);
  const [judgeCorrectCount, setJudgeCorrectCount] = useState(0);
  const [clueFoundCount, setClueFoundCount] = useState(0);
  const [collectedClueIds, setCollectedClueIds] = useState<string[]>([]);
  /** 방금 수첩에 새로 기록된 단서 (해설 패널에서 강조) */
  const [newClueIds, setNewClueIds] = useState<string[]>([]);

  const rounds = content.rounds;
  const totalRounds = rounds.length;
  const round: DfRound | undefined = rounds[roundIndex];
  const fakeCount = useMemo(() => rounds.filter((r) => r.isFake).length, [rounds]);

  const start = useCallback(() => {
    setPhase("playing");
    setRoundIndex(0);
    setRoundState(FRESH_ROUND);
    setScore(0);
    setJudgeCorrectCount(0);
    setClueFoundCount(0);
    setCollectedClueIds([]);
    setNewClueIds([]);
  }, []);

  /** 단서를 수첩에 기록한다 (이미 있는 종류는 건너뜀) */
  const collectClues = useCallback(
    (clueIds: string[]) => {
      const fresh = clueIds.filter((id) => !collectedClueIds.includes(id));
      setNewClueIds(fresh);
      if (fresh.length > 0) {
        setCollectedClueIds((prev) => [
          ...prev,
          ...fresh.filter((id) => !prev.includes(id)),
        ]);
      }
    },
    [collectedClueIds],
  );

  /** 1단계 — 진짜/가짜 판별 */
  const judge = useCallback(
    (saidFake: boolean) => {
      if (phase !== "playing" || !round || roundState.step !== "judge") return;
      const correct = saidFake === round.isFake;
      if (correct) {
        setScore((s) => s + content.rules.judgePoints);
        setJudgeCorrectCount((n) => n + 1);
      }
      setNewClueIds([]);
      setRoundState({
        ...FRESH_ROUND,
        judge: { saidFake, correct },
        // 가짜를 맞혔을 때만 단서 찾기 기회가 열린다
        step: correct && round.isFake ? "hunt" : "explain",
        hunt: correct && round.isFake ? null : "skipped",
      });
    },
    [phase, round, roundState.step, content.rules.judgePoints],
  );

  /** 2단계(사진) — 이상한 곳 클릭. anomalyId 가 null 이면 빗나간 것 */
  const pickImageSpot = useCallback(
    (anomalyId: string | null) => {
      if (phase !== "playing" || !round || round.type !== "image") return;
      if (roundState.step !== "hunt") return;
      const found = anomalyId !== null;
      if (found) {
        setScore((s) => s + content.rules.cluePoints);
        setClueFoundCount((n) => n + 1);
        // 하나만 찾아도 이 사진의 단서 종류를 모두 수첩에 기록한다
        collectClues((round.anomalies ?? []).map((a) => a.clueId));
      }
      setRoundState((prev) => ({
        ...prev,
        step: "explain",
        hunt: found ? "found" : "missed",
        foundAnomalyId: anomalyId,
      }));
    },
    [phase, round, roundState.step, content.rules.cluePoints, collectClues],
  );

  /** 2단계(글) — 수상한 문장 클릭 */
  const pickSentence = useCallback(
    (index: number) => {
      if (phase !== "playing" || !round || round.type !== "text") return;
      if (roundState.step !== "hunt") return;
      const found = index === round.suspiciousIndex;
      if (found) {
        setScore((s) => s + content.rules.cluePoints);
        setClueFoundCount((n) => n + 1);
        if (round.clueId) collectClues([round.clueId]);
      }
      setRoundState((prev) => ({
        ...prev,
        step: "explain",
        hunt: found ? "found" : "missed",
        pickedSentence: index,
      }));
    },
    [phase, round, roundState.step, content.rules.cluePoints, collectClues],
  );

  /** 3단계 — 다음 사건 또는 결과로 */
  const next = useCallback(() => {
    if (phase !== "playing" || roundState.step !== "explain") return;
    if (roundIndex + 1 >= totalRounds) {
      setPhase("result");
    } else {
      setRoundIndex((i) => i + 1);
      setRoundState(FRESH_ROUND);
      setNewClueIds([]);
    }
  }, [phase, roundState.step, roundIndex, totalRounds]);

  const retry = useCallback(() => {
    setPhase("intro");
  }, []);

  /** 점수에 맞는 탐정 등급 (min 이 높은 것부터) */
  const grade = useMemo(() => {
    const sorted = [...content.grades].sort((a, b) => b.min - a.min);
    return sorted.find((g) => score >= g.min) ?? sorted[sorted.length - 1];
  }, [content.grades, score]);

  return {
    phase,
    roundIndex,
    totalRounds,
    round,
    step: roundState.step,
    judgeResult: roundState.judge,
    huntResult: roundState.hunt,
    foundAnomalyId: roundState.foundAnomalyId,
    pickedSentence: roundState.pickedSentence,
    score,
    judgeCorrectCount,
    clueFoundCount,
    fakeCount,
    collectedClueIds,
    newClueIds,
    grade,
    start,
    judge,
    pickImageSpot,
    pickSentence,
    next,
    retry,
  };
}

export type DeepfakeGame = ReturnType<typeof useDeepfakeGame>;

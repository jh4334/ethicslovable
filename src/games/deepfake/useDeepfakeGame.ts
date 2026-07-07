/**
 * 완벽한 가짜 — 게임 상태 관리 훅.
 * 1부 눈 시험(5라운드) → 중간 결과 → 2부 검증 수사(4사건) → 결과의
 * 흐름과 점수 계산을 담당한다. 콘텐츠는 index.tsx에서 로드해 넘겨준다.
 *
 * StrictMode 대비: 판정은 ref 잠금으로 한 라운드에 정확히 한 번만
 * 확정하고, setState 업데이터 안에서는 부수 효과를 일으키지 않는다.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import type {
  DfCase,
  DfCaseVerdict,
  DfConclusion,
  DfContent,
  DfEyeRound,
  DfEyeVerdict,
  DfPhase,
  DfSide,
  DfToolId,
} from "./types";

export interface DeepfakeGame {
  phase: DfPhase;

  /* 1부 · 눈 시험 */
  eyeIndex: number;
  eyeRound: DfEyeRound;
  totalEyeRounds: number;
  /** 눈으로 맞힌 개수 (N/5) */
  eyeScore: number;
  eyeVerdict: DfEyeVerdict | null;
  isLastEyeRound: boolean;

  /* 2부 · 검증 수사 */
  caseIndex: number;
  currentCase: DfCase;
  totalCases: number;
  /** 이번 사건에서 사용한 도구 (사용 순서대로) */
  usedTools: DfToolId[];
  caseVerdict: DfCaseVerdict | null;
  /** 검증으로 맞힌 사건 수 (M/4) */
  verifyScore: number;
  /** 2부 총점 (결론 +10, 절차 보상 +5) */
  caseScore: number;
  /** 도구 0개로 결론을 시도해 경고를 띄운 상태 */
  showNoToolWarning: boolean;
  isLastCase: boolean;

  start: () => void;
  pickEye: (side: DfSide) => void;
  nextEye: () => void;
  startCases: () => void;
  investigate: (tool: DfToolId) => void;
  conclude: (conclusion: DfConclusion) => void;
  nextCase: () => void;
  restart: () => void;
}

export function useDeepfakeGame(content: DfContent): DeepfakeGame {
  const eyeRounds = content.eyeTest.rounds;
  const cases = content.cases;
  const rules = content.caseRules;

  const [phase, setPhase] = useState<DfPhase>("intro");

  /* 1부 상태 */
  const [eyeIndex, setEyeIndex] = useState(0);
  const [eyeScore, setEyeScore] = useState(0);
  const [eyeVerdict, setEyeVerdict] = useState<DfEyeVerdict | null>(null);
  const eyeLockRef = useRef(false);

  /* 2부 상태 */
  const [caseIndex, setCaseIndex] = useState(0);
  const [usedTools, setUsedTools] = useState<DfToolId[]>([]);
  const [caseVerdict, setCaseVerdict] = useState<DfCaseVerdict | null>(null);
  const [verifyScore, setVerifyScore] = useState(0);
  const [caseScore, setCaseScore] = useState(0);
  const [showNoToolWarning, setShowNoToolWarning] = useState(false);
  const caseLockRef = useRef(false);

  const eyeRound = eyeRounds[Math.min(eyeIndex, eyeRounds.length - 1)];
  const currentCase = cases[Math.min(caseIndex, cases.length - 1)];
  const isLastEyeRound = eyeIndex >= eyeRounds.length - 1;
  const isLastCase = caseIndex >= cases.length - 1;

  const resetAll = useCallback(() => {
    setEyeIndex(0);
    setEyeScore(0);
    setEyeVerdict(null);
    eyeLockRef.current = false;
    setCaseIndex(0);
    setUsedTools([]);
    setCaseVerdict(null);
    setVerifyScore(0);
    setCaseScore(0);
    setShowNoToolWarning(false);
    caseLockRef.current = false;
  }, []);

  const start = useCallback(() => {
    resetAll();
    setPhase("eye");
  }, [resetAll]);

  const pickEye = useCallback(
    (side: DfSide) => {
      if (eyeLockRef.current) return;
      eyeLockRef.current = true;
      const correct = side === eyeRound.aiIs;
      setEyeVerdict({ pick: side, correct });
      if (correct) setEyeScore((s) => s + 1);
    },
    [eyeRound],
  );

  const nextEye = useCallback(() => {
    if (!eyeLockRef.current) return; // 아직 판정 전이면 무시
    eyeLockRef.current = false;
    setEyeVerdict(null);
    if (isLastEyeRound) {
      setPhase("mid");
    } else {
      setEyeIndex((i) => i + 1);
    }
  }, [isLastEyeRound]);

  const startCases = useCallback(() => {
    setPhase("case");
  }, []);

  const investigate = useCallback((tool: DfToolId) => {
    if (caseLockRef.current) return; // 결론 후에는 도구 사용 잠금
    setShowNoToolWarning(false);
    setUsedTools((prev) => (prev.includes(tool) ? prev : [...prev, tool]));
  }, []);

  const conclude = useCallback(
    (conclusion: DfConclusion) => {
      if (caseLockRef.current) return;
      // 조사 없이 결론을 내리려 하면 한 번 경고하고 막는다
      if (usedTools.length === 0 && !showNoToolWarning) {
        setShowNoToolWarning(true);
        return;
      }
      caseLockRef.current = true;
      const correct = conclusion === currentCase.answer;
      const gotBonus = usedTools.length >= rules.minToolsForBonus;
      const points =
        (correct ? rules.conclusionPoints : 0) + (gotBonus ? rules.processBonus : 0);
      setCaseVerdict({
        conclusion,
        correct,
        toolCount: usedTools.length,
        gotBonus,
        points,
      });
      setCaseScore((s) => s + points);
      if (correct) setVerifyScore((v) => v + 1);
      setShowNoToolWarning(false);
    },
    [usedTools, showNoToolWarning, currentCase, rules],
  );

  const nextCase = useCallback(() => {
    if (!caseLockRef.current) return; // 아직 결론 전이면 무시
    caseLockRef.current = false;
    setCaseVerdict(null);
    setUsedTools([]);
    setShowNoToolWarning(false);
    if (isLastCase) {
      setPhase("result");
    } else {
      setCaseIndex((i) => i + 1);
    }
  }, [isLastCase]);

  const restart = useCallback(() => {
    resetAll();
    setPhase("intro");
  }, [resetAll]);

  return useMemo(
    () => ({
      phase,
      eyeIndex,
      eyeRound,
      totalEyeRounds: eyeRounds.length,
      eyeScore,
      eyeVerdict,
      isLastEyeRound,
      caseIndex,
      currentCase,
      totalCases: cases.length,
      usedTools,
      caseVerdict,
      verifyScore,
      caseScore,
      showNoToolWarning,
      isLastCase,
      start,
      pickEye,
      nextEye,
      startCases,
      investigate,
      conclude,
      nextCase,
      restart,
    }),
    [
      phase,
      eyeIndex,
      eyeRound,
      eyeRounds.length,
      eyeScore,
      eyeVerdict,
      isLastEyeRound,
      caseIndex,
      currentCase,
      cases.length,
      usedTools,
      caseVerdict,
      verifyScore,
      caseScore,
      showNoToolWarning,
      isLastCase,
      start,
      pickEye,
      nextEye,
      startCases,
      investigate,
      conclude,
      nextCase,
      restart,
    ],
  );
}

/**
 * 모두의 AI — 스테이지형 포용 퍼즐 게임 상태 훅.
 * 화면 흐름: intro → stage(손님이 한 명씩) → final(3개만 남기는 심사) → insight → result
 *
 * 핵심 규칙(모두 결정적이라 StrictMode-safe):
 * - 손님 스테이지: stageOrder 순서대로 장벽 있는 친구가 찾아온다. 개선 카드
 *   '하나'를 골라 시험하고, 그 카드의 helpsBarrierIds에 손님의 장벽이 있으면
 *   성공(카드가 설치됨), 없으면 실패(failLine 피드백 후 다시 고르기).
 * - 스테이지 입장 시 이미 설치된 개선이 손님의 장벽을 덮고 있으면 시험 없이
 *   자동 해결("이미 돼요!") — 한 개선이 여러 사람을 돕는다는 통찰 장치.
 * - 최종 심사: 개선을 budget(3)개만 골라 여섯 명 전원이 유지되는 조합을 찾는다.
 * - rounds = 시험 버튼을 누른 총횟수. 적을수록 높은 등급.
 * - 카드가 누구를 돕는지는 시험해 본 카드만 공개된다(revealedIds).
 */
import { useCallback, useMemo, useState } from "react";
import type {
  AfContent,
  AfFinalResult,
  AfGrade,
  AfPhase,
  AfStageStatus,
  AfBarrier,
  AfUser,
} from "./types";

export interface AiFairGame {
  phase: AfPhase;
  /** 현재 손님 스테이지 번호 (0부터) */
  stageIndex: number;
  /** 손님 스테이지 총 수 */
  stageTotal: number;
  /** 지금 찾아온 손님 (stage 페이즈에서만) */
  currentGuest: AfUser | null;
  /** 지금 손님의 접근 장벽 */
  currentBarrier: AfBarrier | null;
  stageStatus: AfStageStatus;
  /** 이번 스테이지에서 고른 카드 id */
  selectedId: string | null;
  /** 이번 스테이지에서 틀렸던 카드 id */
  triedIds: string[];
  /** 방금 실패한 카드 id (failLine 표시용) */
  lastFailedId: string | null;
  /** 손님 스테이지에서 성공해 설치된 카드 id (누적) */
  installed: string[];
  /** 효과가 공개된 카드 id (한 번이라도 시험에 들어간 카드) */
  revealedIds: string[];
  /** 시험 버튼을 누른 총횟수 */
  rounds: number;
  /** 지금까지(설치 기준) 쓸 수 있는 친구 id */
  enabledIds: string[];
  baselineIds: string[];
  /* ---- 최종 심사 ---- */
  finalSelected: string[];
  finalBudget: number;
  finalResult: AfFinalResult | null;
  /** 최종으로 남긴 개선 카드 객체 (통찰·결과 화면용) */
  keptCards: AfContent["improvements"];
  /** 최종 심사까지 통과했는가 */
  solved: boolean;
  grade: AfGrade;
  start: () => void;
  selectCard: (id: string) => void;
  testStage: () => void;
  nextStage: () => void;
  toggleFinal: (id: string) => void;
  testFinal: () => void;
  goInsight: () => void;
  goResult: () => void;
  restart: () => void;
}

/** 카드 목록이 없애 주는 장벽 id 집합 */
function fixedBarrierSet(content: AfContent, cardIds: string[]): Set<string> {
  const ids = new Set(cardIds);
  const fixed = new Set<string>();
  for (const imp of content.improvements) {
    if (ids.has(imp.id)) for (const b of imp.helpsBarrierIds) fixed.add(b);
  }
  return fixed;
}

/** 카드 목록으로 쓸 수 있게 되는 친구 id 목록을 결정적으로 계산 */
function computeEnabled(content: AfContent, cardIds: string[]): string[] {
  const fixed = fixedBarrierSet(content, cardIds);
  return content.users
    .filter((u) => u.canUseBaseline || (u.barrierId !== "" && fixed.has(u.barrierId)))
    .map((u) => u.id);
}

function pickGrade(grades: AfGrade[], rounds: number): AfGrade {
  const sorted = [...grades].sort((a, b) => a.maxRounds - b.maxRounds);
  return sorted.find((g) => rounds <= g.maxRounds) ?? sorted[sorted.length - 1];
}

export function useAiFairGame(content: AfContent): AiFairGame {
  const baselineIds = useMemo(
    () => content.users.filter((u) => u.canUseBaseline).map((u) => u.id),
    [content.users],
  );
  const stageTotal = content.stageOrder.length;

  const [phase, setPhase] = useState<AfPhase>("intro");
  const [stageIndex, setStageIndex] = useState(0);
  const [stageStatus, setStageStatus] = useState<AfStageStatus>("pick");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [triedIds, setTriedIds] = useState<string[]>([]);
  const [lastFailedId, setLastFailedId] = useState<string | null>(null);
  const [installed, setInstalled] = useState<string[]>([]);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [rounds, setRounds] = useState(0);
  const [finalSelected, setFinalSelected] = useState<string[]>([]);
  const [finalResult, setFinalResult] = useState<AfFinalResult | null>(null);

  const currentGuest = useMemo(() => {
    if (phase !== "stage") return null;
    const id = content.stageOrder[stageIndex];
    return content.users.find((u) => u.id === id) ?? null;
  }, [phase, stageIndex, content.stageOrder, content.users]);

  const currentBarrier = useMemo(() => {
    if (!currentGuest || currentGuest.barrierId === "") return null;
    return content.barriers.find((b) => b.id === currentGuest.barrierId) ?? null;
  }, [currentGuest, content.barriers]);

  const enabledIds = useMemo(
    () => computeEnabled(content, installed),
    [content, installed],
  );

  const keptCards = useMemo(() => {
    const source = finalResult?.solved ? finalSelected : installed;
    return content.improvements.filter((i) => source.includes(i.id));
  }, [content.improvements, finalResult, finalSelected, installed]);

  const solved = Boolean(finalResult?.solved);

  const start = useCallback(() => {
    setPhase("stage");
    setStageIndex(0);
    setStageStatus("pick"); // 첫 손님은 설치 카드가 없어 자동 해결이 불가능
    setSelectedId(null);
    setTriedIds([]);
    setLastFailedId(null);
    setInstalled([]);
    setRevealedIds([]);
    setRounds(0);
    setFinalSelected([]);
    setFinalResult(null);
  }, []);

  const selectCard = useCallback(
    (id: string) => {
      if (stageStatus === "solved" || stageStatus === "auto") return;
      setSelectedId((prev) => (prev === id ? null : id));
      setStageStatus("pick");
      setLastFailedId(null);
    },
    [stageStatus],
  );

  const testStage = useCallback(() => {
    if (!selectedId || !currentGuest || currentGuest.barrierId === "") return;
    if (stageStatus === "solved" || stageStatus === "auto") return;
    const card = content.improvements.find((i) => i.id === selectedId);
    if (!card) return;

    setRounds((r) => r + 1);
    setRevealedIds((prev) => (prev.includes(card.id) ? prev : [...prev, card.id]));

    if (card.helpsBarrierIds.includes(currentGuest.barrierId)) {
      setInstalled((prev) => (prev.includes(card.id) ? prev : [...prev, card.id]));
      setStageStatus("solved");
      setLastFailedId(null);
    } else {
      setTriedIds((prev) => (prev.includes(card.id) ? prev : [...prev, card.id]));
      setLastFailedId(card.id);
      setSelectedId(null);
      setStageStatus("fail");
    }
  }, [selectedId, currentGuest, stageStatus, content.improvements]);

  const nextStage = useCallback(() => {
    const next = stageIndex + 1;
    if (next >= stageTotal) {
      setPhase("final");
      setFinalSelected([]);
      setFinalResult(null);
      return;
    }
    const nextGuestId = content.stageOrder[next];
    const nextGuest = content.users.find((u) => u.id === nextGuestId);
    const fixed = fixedBarrierSet(content, installed);
    const auto = Boolean(nextGuest && nextGuest.barrierId !== "" && fixed.has(nextGuest.barrierId));
    setStageIndex(next);
    setStageStatus(auto ? "auto" : "pick");
    setSelectedId(null);
    setTriedIds([]);
    setLastFailedId(null);
  }, [stageIndex, stageTotal, content, installed]);

  const toggleFinal = useCallback(
    (id: string) => {
      setFinalResult(null);
      setFinalSelected((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= content.finalStage.budget) return prev;
        return [...prev, id];
      });
    },
    [content.finalStage.budget],
  );

  const testFinal = useCallback(() => {
    if (finalSelected.length !== content.finalStage.budget) return;
    setRounds((r) => r + 1);
    setRevealedIds((prev) => {
      const next = [...prev];
      for (const id of finalSelected) if (!next.includes(id)) next.push(id);
      return next;
    });
    const enabled = computeEnabled(content, finalSelected);
    const enabledSet = new Set(enabled);
    const blockedIds = content.users.filter((u) => !enabledSet.has(u.id)).map((u) => u.id);
    setFinalResult({
      enabledIds: enabled,
      blockedIds,
      solved: enabled.length === content.users.length,
    });
  }, [finalSelected, content]);

  const goInsight = useCallback(() => setPhase("insight"), []);
  const goResult = useCallback(() => setPhase("result"), []);

  const restart = useCallback(() => {
    setPhase("intro");
    setStageIndex(0);
    setStageStatus("pick");
    setSelectedId(null);
    setTriedIds([]);
    setLastFailedId(null);
    setInstalled([]);
    setRevealedIds([]);
    setRounds(0);
    setFinalSelected([]);
    setFinalResult(null);
  }, []);

  const grade = useMemo(() => pickGrade(content.grades, rounds), [content.grades, rounds]);

  return {
    phase,
    stageIndex,
    stageTotal,
    currentGuest,
    currentBarrier,
    stageStatus,
    selectedId,
    triedIds,
    lastFailedId,
    installed,
    revealedIds,
    rounds,
    enabledIds,
    baselineIds,
    finalSelected,
    finalBudget: content.finalStage.budget,
    finalResult,
    keptCards,
    solved,
    grade,
    start,
    selectCard,
    testStage,
    nextStage,
    toggleFinal,
    testFinal,
    goInsight,
    goResult,
    restart,
  };
}

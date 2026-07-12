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
 *
 * 교사 편집(JSON) 방어: stageOrder의 잘못된 id(오타·기본 사용자)는 걸러 내고,
 * budget은 1~카드 수로 강제해, 콘텐츠 실수로 게임이 막히지 않게 한다.
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
  /** 유효성 검사를 통과한 손님 id 순서 (진행 점 표시용) */
  guestIds: string[];
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
  /** 현재 설계(최종 통과 후엔 남긴 3개 기준)로 쓸 수 있는 친구 id */
  enabledIds: string[];
  /* ---- 최종 심사 ---- */
  finalSelected: string[];
  finalBudget: number;
  finalResult: AfFinalResult | null;
  /** 최종으로 남긴 개선 카드 객체 (통찰·결과 화면용) */
  keptCards: AfContent["improvements"];
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
  // stageOrder 방어: 존재하지 않는 id·장벽 없는(기본) 사용자는 걸러 낸다 —
  // 교사가 JSON에 오타를 내도 게임이 빈 화면·무한 시험으로 막히지 않는다.
  const stageIds = useMemo(
    () =>
      content.stageOrder.filter((id) => {
        const u = content.users.find((x) => x.id === id);
        return Boolean(u && u.barrierId !== "");
      }),
    [content.stageOrder, content.users],
  );
  const stageTotal = stageIds.length;

  // budget 방어: 최소 1, 최대 카드 수
  const finalBudget = Math.min(
    Math.max(1, content.finalStage.budget),
    content.improvements.length,
  );

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
    const id = stageIds[stageIndex];
    return content.users.find((u) => u.id === id) ?? null;
  }, [phase, stageIndex, stageIds, content.users]);

  const currentBarrier = useMemo(() => {
    if (!currentGuest || currentGuest.barrierId === "") return null;
    return content.barriers.find((b) => b.id === currentGuest.barrierId) ?? null;
  }, [currentGuest, content.barriers]);

  // 최종 통과 후엔 '남긴 조합' 기준 — 결과 화면 수치가 서사(3개만 남김)와 일치한다
  const keptSource = finalResult?.solved ? finalSelected : installed;

  const enabledIds = useMemo(
    () => computeEnabled(content, keptSource),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content, finalResult, finalSelected, installed],
  );

  const keptCards = useMemo(
    () => content.improvements.filter((i) => keptSource.includes(i.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content.improvements, finalResult, finalSelected, installed],
  );

  /** start/restart 공용 초기화 — 새 상태가 생기면 여기 한 곳만 고친다 */
  const resetAll = useCallback(() => {
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

  const start = useCallback(() => {
    resetAll();
    // 손님이 하나도 없으면(콘텐츠 편집 실수) 바로 최종 심사로
    setPhase(stageTotal > 0 ? "stage" : "final");
  }, [resetAll, stageTotal]);

  const restart = useCallback(() => {
    resetAll();
    setPhase("intro");
  }, [resetAll]);

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
    const nextGuest = content.users.find((u) => u.id === stageIds[next]);
    const fixed = fixedBarrierSet(content, installed);
    const auto = Boolean(nextGuest && nextGuest.barrierId !== "" && fixed.has(nextGuest.barrierId));
    setStageIndex(next);
    setStageStatus(auto ? "auto" : "pick");
    setSelectedId(null);
    setTriedIds([]);
    setLastFailedId(null);
  }, [stageIndex, stageTotal, stageIds, content, installed]);

  const toggleFinal = useCallback(
    (id: string) => {
      setFinalResult(null);
      setFinalSelected((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= finalBudget) return prev;
        return [...prev, id];
      });
    },
    [finalBudget],
  );

  const testFinal = useCallback(() => {
    if (finalSelected.length !== finalBudget) return;
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
  }, [finalSelected, finalBudget, content]);

  const goInsight = useCallback(() => setPhase("insight"), []);
  const goResult = useCallback(() => setPhase("result"), []);

  const grade = useMemo(() => pickGrade(content.grades, rounds), [content.grades, rounds]);

  return {
    phase,
    stageIndex,
    stageTotal,
    guestIds: stageIds,
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
    finalSelected,
    finalBudget,
    finalResult,
    keptCards,
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

/**
 * 모두의 AI — 포용 퍼즐 게임 상태 훅.
 * 화면 흐름: intro → build(넣기→시험→개선 루프) → insight(6/6 달성) → result
 *
 * 핵심 규칙(모두 결정적이라 StrictMode-safe):
 * - 친구가 누리봇을 '쓸 수 있다' = 기본 사용자이거나, 장착한 개선 카드 중
 *   하나라도 그 친구의 접근 장벽(barrierId)을 없애 주면 참.
 * - '다시 시험하기'를 누를 때마다 판정하고, 아직 6/6이 아니면 슬롯이 한 칸
 *   늘어난다(최대 config.slotsMax). 그래서 어떤 조합으로도 결국 6/6에 도달한다.
 */
import { useCallback, useMemo, useState } from "react";
import type { AfContent, AfGrade, AfPhase, AfTestResult } from "./types";

export interface AiFairGame {
  phase: AfPhase;
  /** 현재 개선 슬롯 수 */
  slots: number;
  /** 장착한 개선 카드 id (넣은 순서) */
  equipped: string[];
  /** 장착한 개선 카드 객체 */
  equippedCards: AfContent["improvements"];
  /** 가장 최근 시험에서 '쓸 수 있는' 친구 id (시험 전엔 기본 사용자) */
  enabledIds: string[];
  /** 처음부터 쓸 수 있는 기본 사용자 id */
  baselineIds: string[];
  /** 지금까지 '다시 시험하기'를 누른 횟수 */
  rounds: number;
  /** 가장 최근 시험 결과 (없으면 아직 시험 전) */
  lastTest: AfTestResult | null;
  /** 여섯 명 모두 쓸 수 있게 됐는가 */
  solved: boolean;
  /** 결과용 설계자 등급 */
  grade: AfGrade;
  start: () => void;
  toggleCard: (id: string) => void;
  runTest: () => void;
  goInsight: () => void;
  goResult: () => void;
  restart: () => void;
}

/** 장착 카드로 쓸 수 있게 되는 친구 id 목록을 결정적으로 계산 */
function computeEnabled(content: AfContent, equipped: string[]): string[] {
  const equippedSet = new Set(equipped);
  // 장착 카드가 없애 주는 장벽 id 모음
  const fixedBarriers = new Set<string>();
  for (const imp of content.improvements) {
    if (equippedSet.has(imp.id)) {
      for (const b of imp.helpsBarrierIds) fixedBarriers.add(b);
    }
  }
  return content.users
    .filter((u) => u.canUseBaseline || (u.barrierId !== "" && fixedBarriers.has(u.barrierId)))
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

  const [phase, setPhase] = useState<AfPhase>("intro");
  const [slots, setSlots] = useState(content.config.slotsStart);
  const [equipped, setEquipped] = useState<string[]>([]);
  const [enabledIds, setEnabledIds] = useState<string[]>(baselineIds);
  const [rounds, setRounds] = useState(0);
  const [lastTest, setLastTest] = useState<AfTestResult | null>(null);

  const solved = enabledIds.length === content.users.length;

  const equippedCards = useMemo(
    () => content.improvements.filter((i) => equipped.includes(i.id)),
    [content.improvements, equipped],
  );

  const start = useCallback(() => {
    setPhase("build");
    setSlots(content.config.slotsStart);
    setEquipped([]);
    setEnabledIds(baselineIds);
    setRounds(0);
    setLastTest(null);
  }, [content.config.slotsStart, baselineIds]);

  const toggleCard = useCallback(
    (id: string) => {
      setEquipped((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= slots) return prev; // 슬롯이 가득 차면 못 넣는다
        return [...prev, id];
      });
    },
    [slots],
  );

  const runTest = useCallback(() => {
    const enabled = computeEnabled(content, equipped);
    const prevSet = new Set(enabledIds);
    const enabledSet = new Set(enabled);
    const newlyEnabledIds = enabled.filter((id) => !prevSet.has(id));
    const blockedIds = content.users.filter((u) => !enabledSet.has(u.id)).map((u) => u.id);
    const nowSolved = enabled.length === content.users.length;
    const slotGrew = !nowSolved && slots < content.config.slotsMax;

    setEnabledIds(enabled);
    setRounds((r) => r + 1);
    if (slotGrew) setSlots((s) => Math.min(s + 1, content.config.slotsMax));
    setLastTest({
      enabledIds: enabled,
      newlyEnabledIds,
      blockedIds,
      slotGrew,
      solved: nowSolved,
    });
  }, [content, equipped, enabledIds, slots]);

  const goInsight = useCallback(() => setPhase("insight"), []);
  const goResult = useCallback(() => setPhase("result"), []);

  const restart = useCallback(() => {
    setPhase("intro");
    setSlots(content.config.slotsStart);
    setEquipped([]);
    setEnabledIds(baselineIds);
    setRounds(0);
    setLastTest(null);
  }, [content.config.slotsStart, baselineIds]);

  const grade = useMemo(() => pickGrade(content.grades, rounds), [content.grades, rounds]);

  return {
    phase,
    slots,
    equipped,
    equippedCards,
    enabledIds,
    baselineIds,
    rounds,
    lastTest,
    solved,
    grade,
    start,
    toggleCard,
    runTest,
    goInsight,
    goResult,
    restart,
  };
}

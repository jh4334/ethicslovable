/**
 * AI와 함께 크는 나 — 게임 상태 관리 훅.
 * 1부(상황 6개 선택 → 해설), 2부(AI가 잘하는 것 vs 나만 할 수 있는 것 분류),
 * 결과(성장 씨앗 집계·등급)를 담당한다.
 *
 * StrictMode 안전: 진행은 모두 사용자 클릭(이벤트 핸들러)으로만 굴러가고
 * 타이머·자동 이펙트가 없어, 이펙트가 두 번 돌아도 상태가 어긋나지 않는다.
 * 분류 카드 섞기는 이벤트 핸들러(start/restart)와 lazy state 초기화에서만
 * 하므로 렌더마다 순서가 바뀌지 않는다.
 */
import { useCallback, useMemo, useState } from "react";
import type { AgContent, AgSortCard, Phase, SituationStage } from "./types";

/** Fisher–Yates 셔플 — 원본을 건드리지 않고 새 배열을 돌려준다 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 콘텐츠의 aiCan/onlyHuman 을 한 벌 카드로 합쳐 섞는다 */
function buildDeck(content: AgContent): AgSortCard[] {
  const { aiCan, onlyHuman } = content.humanVsAi;
  const cards: AgSortCard[] = [
    ...aiCan.map((text) => ({ text, isHumanOnly: false })),
    ...onlyHuman.map((text) => ({ text, isHumanOnly: true })),
  ];
  return shuffle(cards);
}

export interface AiGrowGame {
  phase: Phase;
  /** 지금 진행 중인 상황 인덱스 */
  sitIndex: number;
  sitStage: SituationStage;
  /** 상황별로 고른 선택지 인덱스 (아직 안 골랐으면 null) */
  sitChoices: (number | null)[];
  /** 나를 키우는 선택 수 = 모은 성장 씨앗 수 */
  seeds: number;

  /** 섞어 낸 분류 카드 한 벌 */
  sortDeck: AgSortCard[];
  /** 지금 보여 주는 카드 인덱스 */
  sortIndex: number;
  /** 방금 카드 판정 (선택 전이면 null) */
  sortLastCorrect: boolean | null;
  /** 맞게 분류한 카드 수 */
  sortCorrect: number;

  start: () => void;
  choose: (choiceIndex: number) => void;
  nextSituation: () => void;
  sortCard: (pickedHumanOnly: boolean) => void;
  nextCard: () => void;
  restart: () => void;
}

export function useAiGrowGame(content: AgContent): AiGrowGame {
  const situations = content.situations;
  const totalSituations = situations.length;

  const [phase, setPhase] = useState<Phase>("start");
  const [sitIndex, setSitIndex] = useState(0);
  const [sitStage, setSitStage] = useState<SituationStage>("choosing");
  const [sitChoices, setSitChoices] = useState<(number | null)[]>(() =>
    situations.map(() => null),
  );

  const [sortDeck, setSortDeck] = useState<AgSortCard[]>(() =>
    buildDeck(content),
  );
  const [sortIndex, setSortIndex] = useState(0);
  const [sortLastCorrect, setSortLastCorrect] = useState<boolean | null>(null);
  const [sortResults, setSortResults] = useState<boolean[]>([]);

  const start = useCallback(() => {
    setPhase("situations");
    setSitIndex(0);
    setSitStage("choosing");
    setSitChoices(situations.map(() => null));
    setSortDeck(buildDeck(content));
    setSortIndex(0);
    setSortLastCorrect(null);
    setSortResults([]);
  }, [situations, content]);

  const choose = useCallback(
    (choiceIndex: number) => {
      if (sitStage !== "choosing") return; // 중복 클릭 방지
      setSitChoices((prev) => {
        const next = [...prev];
        next[sitIndex] = choiceIndex;
        return next;
      });
      setSitStage("feedback");
    },
    [sitStage, sitIndex],
  );

  const nextSituation = useCallback(() => {
    if (sitStage !== "feedback") return;
    if (sitIndex >= totalSituations - 1) {
      setPhase("sort");
      return;
    }
    setSitIndex((i) => i + 1);
    setSitStage("choosing");
  }, [sitStage, sitIndex, totalSituations]);

  const sortCard = useCallback(
    (pickedHumanOnly: boolean) => {
      if (sortLastCorrect !== null) return; // 이미 판정됨
      const card = sortDeck[sortIndex];
      if (!card) return;
      const correct = pickedHumanOnly === card.isHumanOnly;
      setSortLastCorrect(correct);
      setSortResults((prev) => [...prev, correct]);
    },
    [sortLastCorrect, sortDeck, sortIndex],
  );

  const nextCard = useCallback(() => {
    if (sortLastCorrect === null) return; // 판정 후에만 진행
    if (sortIndex >= sortDeck.length - 1) {
      setPhase("finale");
      return;
    }
    setSortIndex((i) => i + 1);
    setSortLastCorrect(null);
  }, [sortLastCorrect, sortIndex, sortDeck.length]);

  const restart = useCallback(() => {
    setPhase("start");
    setSitIndex(0);
    setSitStage("choosing");
    setSitChoices(situations.map(() => null));
    setSortDeck(buildDeck(content));
    setSortIndex(0);
    setSortLastCorrect(null);
    setSortResults([]);
  }, [situations, content]);

  const seeds = useMemo(
    () =>
      sitChoices.reduce<number>((acc, choice, i) => {
        if (choice == null) return acc;
        return acc + (situations[i]?.choices[choice]?.isGrowth ? 1 : 0);
      }, 0),
    [sitChoices, situations],
  );

  const sortCorrect = useMemo(
    () => sortResults.filter(Boolean).length,
    [sortResults],
  );

  return useMemo(
    () => ({
      phase,
      sitIndex,
      sitStage,
      sitChoices,
      seeds,
      sortDeck,
      sortIndex,
      sortLastCorrect,
      sortCorrect,
      start,
      choose,
      nextSituation,
      sortCard,
      nextCard,
      restart,
    }),
    [
      phase,
      sitIndex,
      sitStage,
      sitChoices,
      seeds,
      sortDeck,
      sortIndex,
      sortLastCorrect,
      sortCorrect,
      start,
      choose,
      nextSituation,
      sortCard,
      nextCard,
      restart,
    ],
  );
}

/**
 * 뽑기 상자의 비밀 — 게임 상태 훅.
 * 화면 흐름: intro → shop(자유 뽑기) → reveal(확률 공개) → tricks(상술 해부)
 *            → scenario(현명한 선택) → result
 *
 * 확률 구현: 단순 누적 분포. Math.random()은 draw() 안에서만 호출되고,
 * draw()는 반드시 클릭 이벤트 핸들러에서만 불린다. (StrictMode-safe)
 */
import { useCallback, useMemo, useState } from "react";
import type { GbContent, GbPhase, GbRarity, PullRecord } from "./types";

export interface GachaGame {
  phase: GbPhase;
  /** 남은 코인 */
  coins: number;
  /** 지금까지의 뽑기 기록 (시간순) */
  pulls: PullRecord[];
  /** 코인으로 가능한 최대 뽑기 횟수 (10) */
  maxPulls: number;
  /** 등급 key → 내 뽑기 횟수 */
  rarityCounts: Record<string, number>;
  nearMissCount: number;
  spentCoins: number;
  /** 퀴즈에서 고른 보기 번호 (null = 아직) */
  quizChoice: number | null;
  quizCorrect: boolean | null;
  /** 시나리오에서 고른 선택지 번호 (null = 아직) */
  scenarioChoice: number | null;
  /** 체크리스트 각 항목 체크 여부 */
  checked: boolean[];
  start: () => void;
  /** 뽑기 1회. 코인 부족이면 null. 이벤트 핸들러에서만 호출할 것. */
  draw: () => PullRecord | null;
  stopShopping: () => void;
  answerQuiz: (choice: number) => void;
  goTricks: () => void;
  goScenario: () => void;
  chooseScenario: (choice: number) => void;
  toggleCheck: (index: number) => void;
  goResult: () => void;
  restart: () => void;
}

/** 누적 분포로 등급 결정 — rarities 순서대로 확률을 쌓아 가며 고른다 */
function rollRarity(rarities: GbRarity[], roll: number): GbRarity {
  let acc = 0;
  for (const rarity of rarities) {
    acc += rarity.probability;
    if (roll < acc) return rarity;
  }
  // 부동소수점 오차 대비 — 마지막 등급으로 처리
  return rarities[rarities.length - 1];
}

export function useGachaGame(content: GbContent): GachaGame {
  const [phase, setPhase] = useState<GbPhase>("intro");
  const [coins, setCoins] = useState(content.shop.coins);
  const [pulls, setPulls] = useState<PullRecord[]>([]);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [scenarioChoice, setScenarioChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState<boolean[]>(() =>
    content.checklist.items.map(() => false),
  );

  const { gachaPrice } = content.shop;
  const maxPulls = Math.floor(content.shop.coins / gachaPrice);

  const rarityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const rarity of content.rarities) counts[rarity.key] = 0;
    for (const pull of pulls) counts[pull.rarityKey] = (counts[pull.rarityKey] ?? 0) + 1;
    return counts;
  }, [content.rarities, pulls]);

  const nearMissCount = useMemo(() => pulls.filter((p) => p.nearMiss).length, [pulls]);

  const start = useCallback(() => setPhase("shop"), []);

  const draw = useCallback((): PullRecord | null => {
    if (coins < gachaPrice) return null;
    const rarity = rollRarity(content.rarities, Math.random());
    const item = rarity.pool[Math.floor(Math.random() * rarity.pool.length)];
    // 아쉬움 연출: 희귀 등급일 때 50% 확률로 붙는다. 결과는 불변 — 연출만.
    const nearMiss = rarity.key === "rare" && Math.random() < 0.5;
    const record: PullRecord = {
      index: pulls.length + 1,
      rarityKey: rarity.key,
      item,
      nearMiss,
    };
    setCoins((c) => c - gachaPrice);
    setPulls((prev) => [...prev, record]);
    return record;
  }, [coins, gachaPrice, content.rarities, pulls.length]);

  const stopShopping = useCallback(() => setPhase("reveal"), []);

  const answerQuiz = useCallback((choice: number) => {
    setQuizChoice((prev) => (prev === null ? choice : prev)); // 첫 답만 인정
  }, []);

  const goTricks = useCallback(() => setPhase("tricks"), []);

  const goScenario = useCallback(() => setPhase("scenario"), []);

  const chooseScenario = useCallback((choice: number) => {
    setScenarioChoice(choice);
  }, []);

  const toggleCheck = useCallback((index: number) => {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }, []);

  const goResult = useCallback(() => setPhase("result"), []);

  const restart = useCallback(() => {
    setPhase("intro");
    setCoins(content.shop.coins);
    setPulls([]);
    setQuizChoice(null);
    setScenarioChoice(null);
    setChecked(content.checklist.items.map(() => false));
  }, [content.shop.coins, content.checklist.items]);

  return {
    phase,
    coins,
    pulls,
    maxPulls,
    rarityCounts,
    nearMissCount,
    spentCoins: pulls.length * gachaPrice,
    quizChoice,
    quizCorrect:
      quizChoice === null ? null : quizChoice === content.probabilityReveal.quiz.answerIndex,
    scenarioChoice,
    checked,
    start,
    draw,
    stopShopping,
    answerQuiz,
    goTricks,
    goScenario,
    chooseScenario,
    toggleCheck,
    goResult,
    restart,
  };
}

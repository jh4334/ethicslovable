/**
 * 데이터 편식쟁이 AI — 게임 상태 훅.
 * 화면 흐름: intro → (train → test → roundResult) ×2 → reflection
 * 판정은 먹이기(feed) 시점에 전부 결정적으로 계산해 두고,
 * 시험 화면은 한 문제씩 보여 주기만 한다. (StrictMode-safe)
 */
import { useCallback, useMemo, useState } from "react";
import { judgeRound } from "./judge";
import type {
  DbContent,
  DbPhase,
  DbTrainingCard,
  JudgedTest,
  RoundResult,
} from "./types";

export interface DataBiasGame {
  phase: DbPhase;
  round: 1 | 2;
  /** 학습 단계에서 고른 카드 id 목록 (고른 순서) */
  selected: string[];
  /** 고른 카드 객체 목록 */
  selectedCards: DbTrainingCard[];
  pickCount: number;
  /** 이번 라운드 판정 결과 (feed 이후 채워짐) */
  judged: JudgedTest[];
  /** 시험 진행 중인 문제 번호 (0부터) */
  testIndex: number;
  round1Result: RoundResult | null;
  round2Result: RoundResult | null;
  /** 현재 라운드의 결과 (roundResult 화면용) */
  currentResult: RoundResult | null;
  start: () => void;
  toggleCard: (id: string) => void;
  feed: () => void;
  nextTest: () => void;
  startRound2: () => void;
  goReflection: () => void;
  restart: () => void;
}

function buildResult(round: 1 | 2, judged: JudgedTest[]): RoundResult {
  const correctCount = judged.filter((j) => j.judgement.correct).length;
  const total = judged.length;
  return {
    round,
    correctCount,
    total,
    accuracy: total > 0 ? Math.round((correctCount / total) * 100) : 0,
    judged,
  };
}

export function useDataBiasGame(content: DbContent): DataBiasGame {
  const [phase, setPhase] = useState<DbPhase>("intro");
  const [round, setRound] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [judged, setJudged] = useState<JudgedTest[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [round1Result, setRound1Result] = useState<RoundResult | null>(null);
  const [round2Result, setRound2Result] = useState<RoundResult | null>(null);

  const pickCount = content.rules.pickCount;

  const selectedCards = useMemo(
    () => content.trainingCards.filter((c) => selected.includes(c.id)),
    [content.trainingCards, selected],
  );

  const start = useCallback(() => setPhase("train"), []);

  const toggleCard = useCallback(
    (id: string) => {
      setSelected((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= pickCount) return prev; // 8장 넘게는 못 고른다
        return [...prev, id];
      });
    },
    [pickCount],
  );

  const feed = useCallback(() => {
    if (selectedCards.length !== pickCount) return;
    const testCards = round === 1 ? content.round1TestCards : content.round2TestCards;
    const judgements = judgeRound(testCards, selectedCards, content.babyBot);
    setJudged(testCards.map((card, i) => ({ card, judgement: judgements[i] })));
    setTestIndex(0);
    setPhase("test");
  }, [content, round, selectedCards, pickCount]);

  const nextTest = useCallback(() => {
    if (testIndex + 1 < judged.length) {
      setTestIndex(testIndex + 1);
      return;
    }
    // 마지막 문제였다 → 라운드 결과 확정
    const result = buildResult(round, judged);
    if (round === 1) setRound1Result(result);
    else setRound2Result(result);
    setPhase("roundResult");
  }, [testIndex, judged, round]);

  const startRound2 = useCallback(() => {
    setRound(2);
    setSelected([]);
    setJudged([]);
    setTestIndex(0);
    setPhase("train");
  }, []);

  const goReflection = useCallback(() => setPhase("reflection"), []);

  const restart = useCallback(() => {
    setPhase("intro");
    setRound(1);
    setSelected([]);
    setJudged([]);
    setTestIndex(0);
    setRound1Result(null);
    setRound2Result(null);
  }, []);

  return {
    phase,
    round,
    selected,
    selectedCards,
    pickCount,
    judged,
    testIndex,
    round1Result,
    round2Result,
    currentResult: round === 1 ? round1Result : round2Result,
    start,
    toggleCard,
    feed,
    nextTest,
    startRound2,
    goReflection,
    restart,
  };
}

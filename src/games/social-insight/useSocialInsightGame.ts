/**
 * 게임 상태 훅 — 라운드 생성, 타이머, 점수/콤보, 명예의 전당을 담당한다.
 * React.StrictMode(개발 모드에서 이펙트 2회 실행) 아래에서도 안전하도록
 * 모든 타이머 이펙트는 cleanup을 갖고, setState 업데이터에 부수효과가 없다.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Choice,
  Feedback,
  LeaderboardEntry,
  Phase,
  RoundQuestion,
  SiCategory,
  SiComboPraise,
  SiContent,
  SiPost,
} from "./types";
import {
  getLeaderboard,
  getSavedPlayerName,
  makeEntryId,
  savePlayerName,
  saveToLeaderboard,
} from "./storage";

// 오답·시간초과 해설을 읽을 시간을 준다 — 느린 학생이 연쇄 실패하지 않게
const FEEDBACK_MS = 2000;
const COMBO_FLASH_MS = 900;

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/** 현재 콤보에 해당하는 가장 높은 칭찬 단계를 찾는다 */
export function findComboPraise(
  combo: number,
  praises: SiComboPraise[],
): SiComboPraise | null {
  let best: SiComboPraise | null = null;
  for (const p of praises) {
    if (combo >= p.minCombo && (!best || p.minCombo > best.minCombo)) best = p;
  }
  return best;
}

export function useSocialInsightGame(content: SiContent) {
  const [phase, setPhase] = useState<Phase>("start");
  // 기본 난이도는 '쉬움' — 그냥 시작 버튼을 누르는 학생이 가장 편한 길로
  // 기본은 '쉬움'(있으면) — 연습(무제한) 모드는 선택지로 두되 기본값은 아니게
  const [difficultyId, setDifficultyId] = useState(
    () =>
      content.difficulties.find((d) => d.id === "easy")?.id ??
      content.difficulties[0].id,
  );
  const [playerName, setPlayerName] = useState(() => getSavedPlayerName());
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [question, setQuestion] = useState<RoundQuestion | null>(null);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [comboFlash, setComboFlash] = useState<string | null>(null);
  const [lastEntryId, setLastEntryId] = useState<string | null>(null);
  const [leaderboards, setLeaderboards] = useState<
    Record<string, LeaderboardEntry[]>
  >({});

  const lastHistoryTitleRef = useRef("");

  const difficulty =
    content.difficulties.find((d) => d.id === difficultyId) ??
    content.difficulties[0];
  const totalRounds = content.rules.totalRounds;
  // timeLimit 0 = 연습(무제한) 모드 — 초읽기·시간초과 없이 천천히
  const timed = difficulty.timeLimit > 0;

  // setTimeout/이펙트 안에서 최신 값을 읽기 위한 참조
  const latest = useRef({ round, score, maxCombo, difficulty, playerName });
  latest.current = { round, score, maxCombo, difficulty, playerName };

  // 시작 시 난이도별 명예의 전당을 불러온다 (읽기 실패는 빈 목록)
  useEffect(() => {
    const map: Record<string, LeaderboardEntry[]> = {};
    for (const d of content.difficulties) map[d.id] = getLeaderboard(d.id);
    setLeaderboards(map);
  }, [content]);

  /** 이번 라운드가 함정 라운드인지 */
  const hasTrap =
    difficulty.trapFromRound !== null && round >= difficulty.trapFromRound;

  const setupRound = useCallback(
    (currentRound: number) => {
      const cats = content.categories;
      const cfg = latest.current.difficulty;
      const trapActive =
        cfg.trapFromRound !== null && currentRound >= cfg.trapFromRound;

      // 1) 친구의 관심 카테고리와 (함정 라운드라면) 비추천 카테고리
      const target = pick(cats);
      let dislike: SiCategory | null = null;
      if (trapActive && cats.length > 1) {
        dislike = pick(cats.filter((c) => c.id !== target.id));
      }

      // 2) 방금 좋아요 누른 게시물 (직전 라운드와 겹치지 않게)
      let history: SiPost;
      let attempts = 0;
      do {
        history = pick(target.posts);
        attempts += 1;
      } while (history.title === lastHistoryTitleRef.current && attempts < 5);
      lastHistoryTitleRef.current = history.title;

      // 3) 정답(같은 카테고리의 다른 게시물)
      let correct: SiPost;
      do {
        correct = pick(target.posts);
      } while (correct.title === history.title);

      // 4) 오답(다른 카테고리) + 함정(비추천 카테고리)
      let others = cats.filter(
        (c) => c.id !== target.id && c.id !== dislike?.id,
      );
      if (others.length === 0) others = cats.filter((c) => c.id !== target.id);

      const list: Choice[] = [
        {
          ...correct,
          account: target.account,
          categoryId: target.id,
          isCorrect: true,
          isTrap: false,
        },
      ];
      const wrongCount = Math.max(0, cfg.choiceCount - 1 - (dislike ? 1 : 0));
      for (let i = 0; i < wrongCount; i += 1) {
        const cat = pick(others);
        list.push({
          ...pick(cat.posts),
          account: cat.account,
          categoryId: cat.id,
          isCorrect: false,
          isTrap: false,
        });
      }
      if (dislike) {
        list.push({
          ...pick(dislike.posts),
          account: dislike.account,
          categoryId: dislike.id,
          isCorrect: false,
          isTrap: true,
        });
      }
      list.sort(() => Math.random() - 0.5);

      setQuestion({
        history,
        account: target.account,
        categoryId: target.id,
        categoryLabel: target.label,
        dislikeLabel: dislike?.label ?? null,
        likes: Math.floor(Math.random() * 900) + 100,
      });
      setChoices(list);
      setFeedback(null);
      setShowHint(false);
      setTimeLeft(cfg.timeLimit);
    },
    [content],
  );

  const start = useCallback(() => {
    const trimmed = latest.current.playerName.trim();
    if (trimmed) savePlayerName(trimmed);
    setScore(0);
    setRound(1);
    setCombo(0);
    setMaxCombo(0);
    setLastEntryId(null);
    lastHistoryTitleRef.current = "";
    setPhase("playing");
    setupRound(1);
  }, [setupRound]);

  const goToStart = useCallback(() => setPhase("start"), []);

  const finish = useCallback((finalScore: number) => {
    const { difficulty: cfg, playerName: name, maxCombo: mc } = latest.current;
    const entry: LeaderboardEntry = {
      id: makeEntryId(),
      playerName: name.trim() || "익명 요정",
      score: finalScore,
      maxCombo: mc,
      date: new Date().toLocaleDateString("ko-KR"),
    };
    const updated = saveToLeaderboard(cfg.id, entry);
    setLeaderboards((prev) => ({ ...prev, [cfg.id]: updated }));
    setLastEntryId(entry.id);
    setPhase("result");
  }, []);

  /** 보기 선택 */
  const choose = useCallback(
    (choice: Choice) => {
      if (feedback || phase !== "playing") return;

      if (choice.isCorrect) {
        const newCombo = combo + 1;
        const praise = findComboPraise(newCombo, content.comboPraise);
        const bonus = praise?.bonus ?? 0;
        const points = content.rules.basePoints + bonus;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        setScore((s) => s + points);
        if (praise) setComboFlash(praise.label);
        setFeedback({
          type: "success",
          title: "정답이에요!",
          message:
            bonus > 0
              ? `+${points}점 (콤보 보너스 +${bonus}점)`
              : `+${points}점`,
        });
      } else {
        setCombo(0);
        setFeedback({
          type: "fail",
          title: "아쉬워요!",
          message:
            choice.isTrap && question?.dislikeLabel
              ? `${question.dislikeLabel} 게시물은 이 친구가 그냥 넘겨 버려요!`
              : "이 친구의 관심사와 다른 게시물이에요",
        });
      }
    },
    [feedback, phase, combo, maxCombo, question, content],
  );

  // 초읽기 — 피드백이 뜨면 멈춘다. 연습(무제한) 모드에선 아예 돌지 않는다.
  useEffect(() => {
    if (!timed || phase !== "playing" || feedback || !question) return;
    const id = setInterval(
      () => setTimeLeft((t) => (t > 0 ? t - 1 : 0)),
      1000,
    );
    return () => clearInterval(id);
  }, [timed, phase, feedback, question]);

  // 시간 초과 처리 — 연습 모드에선 없음. 문구는 속도를 탓하지 않는다.
  useEffect(() => {
    if (!timed || phase !== "playing" || feedback || !question || timeLeft > 0) return;
    setCombo(0);
    setFeedback({
      type: "fail",
      title: "시간이 지났어요",
      message: "괜찮아요, 이 친구는 어떤 걸 좋아할까 다시 살펴볼까요?",
    });
  }, [timed, phase, feedback, question, timeLeft]);

  /** 다음 라운드(또는 결과)로 넘어간다 — 시간제한 모드는 자동, 연습 모드는 버튼으로 */
  const advance = useCallback(() => {
    const { round: r, score: s } = latest.current;
    if (r >= totalRounds) {
      finish(s);
    } else {
      setRound(r + 1);
      setupRound(r + 1);
    }
  }, [totalRounds, finish, setupRound]);

  // 시간제한 모드: 피드백을 잠깐 보여 준 뒤 자동으로 넘어간다.
  // 연습 모드: 자동으로 넘어가지 않고 학생이 '다음 ▶' 버튼을 눌러 넘긴다(해설을 충분히 읽게).
  useEffect(() => {
    if (!timed || phase !== "playing" || !feedback) return;
    const t = setTimeout(advance, FEEDBACK_MS);
    return () => clearTimeout(t);
  }, [timed, phase, feedback, advance]);

  // 콤보 칭찬 문구는 잠깐만 보여 준다
  useEffect(() => {
    if (!comboFlash) return;
    const t = setTimeout(() => setComboFlash(null), COMBO_FLASH_MS);
    return () => clearTimeout(t);
  }, [comboFlash]);

  return {
    phase,
    difficulty,
    difficultyId,
    setDifficultyId,
    playerName,
    setPlayerName,
    score,
    round,
    totalRounds,
    combo,
    maxCombo,
    question,
    choices,
    feedback,
    timeLeft,
    timed,
    hasTrap,
    showHint,
    setShowHint,
    comboFlash,
    lastEntryId,
    leaderboards,
    start,
    goToStart,
    choose,
    advance,
  };
}

export type SocialInsightGame = ReturnType<typeof useSocialInsightGame>;

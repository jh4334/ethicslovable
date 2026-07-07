/**
 * 단톡방을 지켜라 — 게임 상태 관리 훅.
 * 에피소드 진행(메시지 순차 등장 → 선택 → 반응 등장 → 판정),
 * 지킴이 배지 집계, 약속 고르기 단계를 담당한다.
 *
 * StrictMode 안전: 메시지·반응의 순차 등장은 모두 상태 기반 useEffect +
 * setTimeout 으로 굴리고, cleanup에서 반드시 타이머를 지운다.
 * (이펙트가 두 번 돌아도 같은 상태에서 같은 다음 상태로만 간다.)
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CgContent, CgQuality, Phase, Stage } from "./types";

/** "오전 8:12" 형식의 시각에 분을 더해 같은 형식으로 돌려준다 */
export function clockAfter(base: string, addMinutes: number): string {
  const m = /(오전|오후)\s*(\d{1,2}):(\d{2})/.exec(base || "");
  if (!m) return base;
  const hour12 = parseInt(m[2], 10) % 12;
  const hour24 = hour12 + (m[1] === "오후" ? 12 : 0);
  let total = hour24 * 60 + parseInt(m[3], 10) + addMinutes;
  total = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const min = total % 60;
  const ampm = h < 12 ? "오전" : "오후";
  const dh = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${dh}:${String(min).padStart(2, "0")}`;
}

export interface ChatGuardGame {
  phase: Phase;
  /** 지금 진행 중인 에피소드 인덱스 */
  epIndex: number;
  stage: Stage;
  /** 현재 에피소드에서 화면에 등장한 상황 메시지 수 */
  revealed: number;
  /** 현재 에피소드에서 화면에 등장한 반응 메시지 수 */
  reactRevealed: number;
  /** "…" 타이핑 인디케이터 표시 여부 */
  typing: boolean;
  /** 에피소드별로 고른 선택지 인덱스 (아직 안 골랐으면 null) */
  results: (number | null)[];
  /** 에피소드별 판정 (선택 전이면 null) */
  qualities: (CgQuality | null)[];
  /** 슬기로운 선택 수 = 지킴이 배지 수 */
  badges: number;
  /** 약속 후보 중 고른 인덱스들 (최대 3개) */
  selectedPromises: number[];
  start: () => void;
  choose: (choiceIndex: number) => void;
  next: () => void;
  togglePromise: (index: number) => void;
  confirmPromises: () => void;
  restart: () => void;
}

export function useChatGuardGame(content: CgContent): ChatGuardGame {
  const episodes = content.episodes;
  const totalEpisodes = episodes.length;

  const [phase, setPhase] = useState<Phase>("start");
  const [epIndex, setEpIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("intro");
  const [revealed, setRevealed] = useState(0);
  const [reactRevealed, setReactRevealed] = useState(0);
  const [typing, setTyping] = useState(false);
  const [results, setResults] = useState<(number | null)[]>(() =>
    episodes.map(() => null),
  );
  const [selectedPromises, setSelectedPromises] = useState<number[]>([]);

  // ── 메시지·반응 순차 등장 페이서 ──────────────────────────────
  useEffect(() => {
    if (phase !== "chat") return;
    const ep = episodes[epIndex];
    if (!ep) return;

    if (stage === "intro") {
      if (revealed >= ep.messages.length) {
        // 마지막 말풍선을 잠깐 읽을 시간을 준 뒤 선택 단계로
        const t = window.setTimeout(() => setStage("choice"), 550);
        return () => window.clearTimeout(t);
      }
      setTyping(true);
      const t = window.setTimeout(
        () => {
          setTyping(false);
          setRevealed((r) => r + 1);
        },
        revealed === 0 ? 750 : 1150,
      );
      return () => window.clearTimeout(t);
    }

    if (stage === "reacting") {
      const chosen = results[epIndex];
      const reactions =
        chosen == null ? [] : ep.choices[chosen]?.reactions ?? [];
      if (reactRevealed >= reactions.length) {
        const t = window.setTimeout(() => setStage("verdict"), 650);
        return () => window.clearTimeout(t);
      }
      setTyping(true);
      const t = window.setTimeout(() => {
        setTyping(false);
        setReactRevealed((r) => r + 1);
      }, 1150);
      return () => window.clearTimeout(t);
    }
  }, [phase, stage, revealed, reactRevealed, epIndex, results, episodes]);

  const start = useCallback(() => {
    setPhase("chat");
    setEpIndex(0);
    setStage("intro");
    setRevealed(0);
    setReactRevealed(0);
    setTyping(false);
    setResults(episodes.map(() => null));
    setSelectedPromises([]);
  }, [episodes]);

  const choose = useCallback(
    (choiceIndex: number) => {
      if (stage !== "choice") return; // 중복 클릭 방지
      setResults((prev) => {
        const next = [...prev];
        next[epIndex] = choiceIndex;
        return next;
      });
      setReactRevealed(0);
      setTyping(false);
      setStage("reacting");
    },
    [stage, epIndex],
  );

  const next = useCallback(() => {
    if (stage !== "verdict") return;
    if (epIndex >= totalEpisodes - 1) {
      setPhase("promise");
      return;
    }
    setEpIndex((i) => i + 1);
    setStage("intro");
    setRevealed(0);
    setReactRevealed(0);
    setTyping(false);
  }, [stage, epIndex, totalEpisodes]);

  const togglePromise = useCallback((index: number) => {
    setSelectedPromises((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= 3) return prev; // 3개까지만
      return [...prev, index];
    });
  }, []);

  const confirmPromises = useCallback(() => {
    if (selectedPromises.length === 3) setPhase("finale");
  }, [selectedPromises]);

  const restart = useCallback(() => {
    setPhase("start");
    setEpIndex(0);
    setStage("intro");
    setRevealed(0);
    setReactRevealed(0);
    setTyping(false);
    setResults(episodes.map(() => null));
    setSelectedPromises([]);
  }, [episodes]);

  const qualities = useMemo(
    () =>
      results.map((r, i) =>
        r == null ? null : episodes[i]?.choices[r]?.quality ?? null,
      ),
    [results, episodes],
  );

  const badges = useMemo(
    () => qualities.filter((q) => q === "wise").length,
    [qualities],
  );

  return useMemo(
    () => ({
      phase,
      epIndex,
      stage,
      revealed,
      reactRevealed,
      typing,
      results,
      qualities,
      badges,
      selectedPromises,
      start,
      choose,
      next,
      togglePromise,
      confirmPromises,
      restart,
    }),
    [
      phase,
      epIndex,
      stage,
      revealed,
      reactRevealed,
      typing,
      results,
      qualities,
      badges,
      selectedPromises,
      start,
      choose,
      next,
      togglePromise,
      confirmPromises,
      restart,
    ],
  );
}

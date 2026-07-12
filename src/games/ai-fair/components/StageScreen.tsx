import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AfContent } from "../types";
import type { AiFairGame } from "../useAiFairGame";
import ImprovementCard from "./ImprovementCard";

interface StageScreenProps {
  content: AfContent;
  game: AiFairGame;
}

/**
 * 손님 스테이지 — 장벽 있는 친구가 한 명씩 설계실에 찾아온다.
 * 학생은 친구의 이야기와 누리봇의 반응을 관찰하고, 개선 카드 하나를 골라
 * 시험한다. 성공하면 다음 손님, 실패하면 왜 안 됐는지 읽고 다시 고른다.
 * 이미 단 개선이 이 손님까지 돕고 있으면 '이미 돼요!'(자동 해결)를 보여 준다.
 */
export default function StageScreen({ content, game }: StageScreenProps) {
  const { ui, users, improvements, stageOrder } = content;
  const [testing, setTesting] = useState(false);

  const guest = game.currentGuest;
  const barrier = game.currentBarrier;

  // 시험 연출: 잠깐 보여 준 뒤 판정 (cleanup으로 StrictMode-safe)
  const { testStage } = game;
  useEffect(() => {
    if (!testing) return;
    const timer = setTimeout(() => {
      testStage();
      setTesting(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, [testing, testStage]);

  // 판정 피드백은 카드 목록 위에 뜬다 — 모바일에서 시험 버튼(하단)을 누른 뒤
  // 결과가 화면 밖에 있지 않도록, 판정이 끝나면 피드백으로 스크롤한다.
  const feedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (testing) return;
    if (game.stageStatus === "solved" || game.stageStatus === "fail" || game.stageStatus === "auto") {
      feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [testing, game.stageStatus]);

  if (!guest) return null;

  const isDone = game.stageStatus === "solved" || game.stageStatus === "auto";
  const isLast = game.stageIndex === game.stageTotal - 1;
  const failedCard = game.lastFailedId
    ? improvements.find((i) => i.id === game.lastFailedId)
    : null;
  const canTest = !testing && !isDone && game.selectedId !== null;

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-in px-4 py-5 pb-6">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="af-pill text-[11px]">
          👋 {ui.guestLabel} {game.stageIndex + 1} / {game.stageTotal}
        </span>
        <h2 className="text-lg font-black">{ui.buildTitle}</h2>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ui.stageGuide}</p>

      {/* 손님 진행 점 — 도운 손님은 초록으로 */}
      <div className="mt-3 flex items-center gap-1.5">
        {stageOrder.map((id, i) => {
          const u = users.find((x) => x.id === id);
          const done = i < game.stageIndex || (i === game.stageIndex && isDone);
          const current = i === game.stageIndex;
          return (
            <span
              key={id}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 text-lg transition-all",
                done ? "af-friend-on" : "af-friend-off",
                current && "ring-2 ring-primary/40",
                !done && !current && "opacity-50 grayscale",
              )}
              title={u?.who}
              aria-hidden
            >
              {done ? "✅" : u?.emoji}
            </span>
          );
        })}
      </div>

      {/* 손님 카드 — 이야기 + 누리봇의 반응 + 관찰한 장벽 */}
      <motion.div
        key={guest.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mlq-card mt-4 p-4"
      >
        <div className="flex items-start gap-3">
          <span className={cn("mlq-emoji-tile h-14 w-14 shrink-0 text-3xl", !isDone && "grayscale")} aria-hidden>
            {guest.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-extrabold">{guest.who}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                  isDone ? "af-tag-on" : "af-tag-off",
                )}
              >
                {isDone ? ui.canUseTag : ui.blockedTag}
              </span>
            </div>
            <p className="mt-1.5 rounded-xl rounded-tl-sm bg-muted/70 px-3 py-2 text-xs leading-relaxed text-foreground/90">
              💬 {guest.arriveLine}
            </p>
          </div>
        </div>
        {!isDone && barrier && (
          <div className="mt-3 space-y-1.5 border-t pt-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              🤖 <b>{ui.nuriBotLabel}</b> — {barrier.blockedLine}
            </p>
            <p className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-foreground/70">
              🔎 {ui.barrierLabel}: {barrier.emoji} {barrier.name}
            </p>
          </div>
        )}
      </motion.div>

      {/* 판정 피드백 묶음 — 스크롤 목표 지점 */}
      <div ref={feedbackRef}>
      {/* 자동 해결 — 이미 단 개선이 이 손님까지 도움 */}
      {game.stageStatus === "auto" && (
        <div className="af-solved af-bounce-in mt-3 rounded-2xl p-4">
          <p className="text-sm font-black">✨ {ui.autoSolvedTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/90">{ui.autoSolvedLine}</p>
          <p className="mt-2 rounded-xl bg-white/60 px-3 py-2 text-xs leading-relaxed text-foreground/90">
            {guest.emoji} “{guest.fixedLine}”
          </p>
        </div>
      )}

      {/* 성공 */}
      {game.stageStatus === "solved" && !testing && (
        <div className="af-solved af-bounce-in mt-3 rounded-2xl p-4">
          <p className="text-sm font-black">🎉 {ui.successTitle}</p>
          <p className="mt-2 rounded-xl bg-white/60 px-3 py-2 text-xs leading-relaxed text-foreground/90">
            {guest.emoji} “{guest.fixedLine}”
          </p>
          {barrier && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 text-[10px] font-bold text-foreground/70">
              🏷️ {barrier.principle}
            </p>
          )}
        </div>
      )}

      {/* 실패 피드백 — 왜 이 카드는 안 됐을까 */}
      <AnimatePresence>
        {game.stageStatus === "fail" && failedCard && !testing && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mlq-card mt-3 border-2 border-destructive/25 p-3.5"
          >
            <p className="text-xs font-extrabold text-foreground/80">
              {failedCard.emoji} {failedCard.name} — 이 손님에겐 효과가 없었어요
            </p>
            <p className="mt-1 text-xs leading-relaxed text-foreground/90">{failedCard.failLine}</p>
            <p className="mt-2 text-[11px] font-semibold text-muted-foreground">💪 {ui.retryLine}</p>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* 카드 트레이 + 시험 버튼 (아직 못 도운 동안만) */}
      {!isDone && (
        <>
          <div className="mt-5">
            <div className="text-sm font-extrabold">🃏 {ui.trayTitle}</div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{ui.trayGuide}</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {improvements.map((imp) => (
                <ImprovementCard
                  key={imp.id}
                  card={imp}
                  users={users}
                  ui={ui}
                  selected={game.selectedId === imp.id}
                  tried={game.triedIds.includes(imp.id)}
                  revealed={game.revealedIds.includes(imp.id)}
                  disabled={testing}
                  onClick={() => game.selectCard(imp.id)}
                />
              ))}
            </div>
          </div>

          {/* 카드를 훑는 동안에도 시험 버튼이 손에 닿도록 하단 고정 */}
          <div className="sticky bottom-3 z-10 mt-4">
            <button
              type="button"
              disabled={!canTest}
              onClick={() => canTest && setTesting(true)}
              className={cn(
                "w-full px-6 py-3 text-sm font-bold shadow-lg",
                canTest ? "af-btn animate-pop" : "cursor-not-allowed rounded-xl bg-muted text-muted-foreground",
              )}
            >
              {testing ? `⏳ ${ui.testingLine}` : `🧪 ${ui.testButton}`}
            </button>
          </div>
        </>
      )}

      {/* 다음 손님 / 최종 심사로 */}
      {isDone && (
        <button
          type="button"
          onClick={game.nextStage}
          className="af-btn mt-4 w-full px-6 py-3 text-sm"
        >
          {isLast ? `🏛️ ${ui.toFinalButton}` : `👋 ${ui.nextButton}`}
        </button>
      )}
    </div>
  );
}

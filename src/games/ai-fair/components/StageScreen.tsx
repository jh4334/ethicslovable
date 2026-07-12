import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AfContent } from "../types";
import type { AiFairGame } from "../useAiFairGame";
import ImprovementCard from "./ImprovementCard";
import TestButton, { useJudgeDelay } from "./TestButton";
import ExitGuard from "@/components/ExitGuard";

/** 동작 축소 설정을 존중하는 스크롤 */
function scrollToward(el: HTMLElement | null, block: ScrollLogicalPosition) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block });
}

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
  const { ui, users, improvements } = content;
  const [testing, startTesting] = useJudgeDelay(game.testStage);

  const guest = game.currentGuest;
  const barrier = game.currentBarrier;

  // 판정 피드백은 카드 목록 위에 뜬다 — 모바일에서 시험 버튼(하단)을 누른 뒤
  // 결과가 화면 밖에 있지 않도록, 판정이 끝나면 피드백으로 스크롤한다.
  const feedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!testing && (game.stageStatus === "solved" || game.stageStatus === "fail")) {
      scrollToward(feedbackRef.current, "center");
    }
  }, [testing, game.stageStatus]);

  // 손님이 바뀌면 손님 소개가 보이도록 맨 위로 — '다음 손님' 버튼은 페이지
  // 하단에 있어, 스크롤을 되돌리지 않으면 새 손님의 이야기(카드를 고르는 데
  // 필요한 정보)가 화면 밖에 남는다. (자동 해결 안내도 상단에 함께 보인다)
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollToward(topRef.current, "start");
  }, [game.stageIndex]);

  // 자동 해결 스테이지는 도착 직후 '다음' 버튼이 같은 자리에 또 뜬다 —
  // 더블클릭 두 번째 클릭이 통찰 화면("이미 돼요!")을 건너뛰지 않게
  // 손님이 바뀌면 잠깐(0.5초) 버튼을 잠근다. (cleanup으로 StrictMode-safe)
  const [nextArmed, setNextArmed] = useState(false);
  useEffect(() => {
    setNextArmed(false);
    const timer = setTimeout(() => setNextArmed(true), 500);
    return () => clearTimeout(timer);
  }, [game.stageIndex]);

  if (!guest) return null;

  const isDone = game.stageStatus === "solved" || game.stageStatus === "auto";
  const isLast = game.stageIndex === game.stageTotal - 1;
  const failedCard = game.lastFailedId
    ? improvements.find((i) => i.id === game.lastFailedId)
    : null;
  const canTest = !testing && !isDone && game.selectedId !== null;

  return (
    <div ref={topRef} className="mx-auto w-full max-w-2xl animate-fade-in px-4 py-5 pb-6">
      <ExitGuard />
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
        {game.guestIds.map((id, i) => {
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
              {failedCard.emoji} {failedCard.name} — {ui.failedCardLead}
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

          <TestButton
            canTest={canTest}
            testing={testing}
            idleLabel={`🧪 ${ui.testButton}`}
            testingLabel={ui.testingLine}
            onTest={startTesting}
          />
        </>
      )}

      {/* 다음 손님 / 최종 심사로 */}
      {isDone && (
        <button
          type="button"
          disabled={!nextArmed}
          onClick={() => nextArmed && game.nextStage()}
          className={cn("af-btn mt-4 w-full px-6 py-3 text-sm", !nextArmed && "opacity-60")}
        >
          {isLast ? `🏛️ ${ui.toFinalButton}` : `👋 ${ui.nextButton}`}
        </button>
      )}
    </div>
  );
}

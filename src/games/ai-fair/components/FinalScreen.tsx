import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AfContent } from "../types";
import type { AiFairGame } from "../useAiFairGame";
import ImprovementCard from "./ImprovementCard";
import TestButton, { useJudgeDelay } from "./TestButton";

interface FinalScreenProps {
  content: AfContent;
  game: AiFairGame;
}

/**
 * 최종 설계 심사 — 개선을 budget(3)개만 남겨 여섯 명 전원이 유지되는
 * 조합을 찾는다. '한 개선이 두 장벽을 덮는다'를 이해해야 통과할 수 있는
 * 이 게임의 진짜 퍼즐. 실패하면 못 쓰게 된 친구를 보여 주고 다시 고른다.
 */
export default function FinalScreen({ content, game }: FinalScreenProps) {
  const { ui, users, improvements, finalStage } = content;
  const [testing, startTesting] = useJudgeDelay(game.testFinal);

  // 심사 결과는 카드 목록 위에 뜬다 — 시험 버튼(하단)을 누른 뒤 결과가
  // 화면 밖에 있지 않도록, 판정이 끝나면 결과로 스크롤한다.
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!testing && game.finalResult) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
  }, [testing, game.finalResult]);

  const picked = game.finalSelected.length;
  const budget = game.finalBudget;
  // 통과하면 카드 트레이·버튼 영역 자체가 사라지므로 solved 검사는 불필요
  const canTest = !testing && picked === budget;
  const result = game.finalResult;
  const total = users.length;
  const enabledCount = result ? result.enabledIds.length : 0;

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-in px-4 py-5 pb-6">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="af-pill text-[11px]">🏛️ {finalStage.title}</span>
        <h2 className="text-lg font-black">{ui.buildTitle}</h2>
      </div>

      {/* 소장님 브리핑 */}
      <div className="af-callout mt-3 rounded-2xl p-4">
        {finalStage.briefs.map((line, i) => (
          <p
            key={i}
            className={cn("text-xs leading-relaxed text-foreground/90", i > 0 && "mt-2")}
          >
            {line}
          </p>
        ))}
      </div>

      {/* 시험 결과 — 포용 미터 + 친구 상태 (시험을 본 뒤에만) */}
      <div ref={resultRef}>
      <AnimatePresence>
        {result && !testing && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3"
          >
            {result.solved ? (
              <div className="af-solved af-bounce-in rounded-2xl p-4 text-center">
                <div className="text-3xl" aria-hidden>
                  🎉
                </div>
                <p className="mt-1 text-sm font-black text-foreground">{finalStage.successLine}</p>
                <button
                  type="button"
                  onClick={game.goInsight}
                  className="af-btn mt-3 w-full px-6 py-3 text-sm"
                >
                  {ui.toInsightButton}
                </button>
              </div>
            ) : (
              <div className="mlq-card border-2 border-destructive/25 p-4">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-bold text-foreground/80">⚖️ {ui.meterLabel}</span>
                  <span className="af-grad-text text-2xl font-black tabular-nums">
                    {enabledCount} / {total}
                  </span>
                </div>
                <p className="mt-2 text-xs font-extrabold text-foreground/80">{finalStage.failLead}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {result.blockedIds.map((id) => {
                    const u = users.find((x) => x.id === id);
                    if (!u) return null;
                    return (
                      <span key={id} className="af-tag-off rounded-full px-2 py-0.5 text-[11px] font-bold">
                        {u.emoji} {u.who}
                      </span>
                    );
                  })}
                </div>
                <p className="mt-2.5 rounded-lg bg-accent/20 px-3 py-2 text-[11px] font-semibold text-accent-foreground">
                  💡 {finalStage.failHint}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* 카드 고르기 (통과 전까지) */}
      {!result?.solved && (
        <>
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold">🃏 {ui.trayTitle}</span>
              <span className="af-pill text-[11px] tabular-nums">
                {picked} / {budget}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{finalStage.pickGuide}</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {improvements.map((imp) => {
                const isPicked = game.finalSelected.includes(imp.id);
                const full = !isPicked && picked >= budget;
                return (
                  <div key={imp.id} className="relative">
                    <ImprovementCard
                      card={imp}
                      users={users}
                      ui={ui}
                      selected={isPicked}
                      revealed={game.revealedIds.includes(imp.id)}
                      disabled={testing || full}
                      onClick={() => game.toggleFinal(imp.id)}
                    />
                    {game.installed.includes(imp.id) && (
                      <span className="absolute -top-1.5 right-2 rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
                        {ui.installedLabel}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <TestButton
            canTest={canTest}
            testing={testing}
            idleLabel={`🏛️ ${finalStage.testButton}`}
            testingLabel={ui.testingLine}
            onTest={startTesting}
          />
          {picked < budget && !testing && (
            <p className="mt-1.5 text-center text-[11px] font-semibold text-muted-foreground">
              {finalStage.needMoreLine}
            </p>
          )}
        </>
      )}
    </div>
  );
}

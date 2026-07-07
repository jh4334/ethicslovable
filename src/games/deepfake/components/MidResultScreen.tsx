import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import type { DfContent } from "../types";
import type { DeepfakeGame } from "../useDeepfakeGame";

interface MidResultScreenProps {
  content: DfContent;
  game: DeepfakeGame;
}

/**
 * 1부가 끝난 뒤의 중간 결과 — "눈으로는 못 가려요"를 몸으로 느끼게 한다.
 * 동전 던지기(50%) 기준선과 내 점수를 나란히 보여 준다.
 */
export default function MidResultScreen({ content, game }: MidResultScreenProps) {
  const { midResult, intro } = content;
  const { eyeScore, totalEyeRounds } = game;
  const pct = Math.round((eyeScore / totalEyeRounds) * 100);
  const reduce = useReducedMotion();

  return (
    <div className="df-shell flex min-h-[calc(100vh-3rem)] items-center justify-center p-4">
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mlq-card w-full max-w-md p-6"
      >
        <h2 className="df-gradient-text mb-4 text-center text-2xl font-black">
          {midResult.title}
        </h2>

        {/* 내 눈 점수 */}
        <div className="mb-1 flex items-end justify-between">
          <span className="text-sm font-bold text-muted-foreground">{midResult.scoreLabel}</span>
          <span className="text-2xl font-black">
            {eyeScore}
            <span className="text-base text-muted-foreground">/{totalEyeRounds}</span>
          </span>
        </div>
        <div className="df-eye-meter mb-1.5">
          <div className="df-eye-meter-fill" style={{ width: `${pct}%` }} />
          <div className="df-coin-mark" style={{ left: "50%" }} aria-hidden />
        </div>
        <div className="mb-3 text-right text-[11px] font-bold text-muted-foreground">
          ▲ 동전 던지기 = 2.5/{totalEyeRounds}
        </div>

        <p className="mb-3 rounded-xl bg-secondary p-3 text-sm leading-relaxed text-secondary-foreground">
          {midResult.coinLine}
        </p>

        {/* 핵심 배움 */}
        <div className="df-reveal-card mb-3 rounded-2xl p-3.5 text-center">
          <p className="text-base font-black leading-relaxed">👀 {midResult.lesson}</p>
        </div>

        {/* 우리 반 통계 활동 제안 */}
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs leading-relaxed">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <span>{midResult.classActivity}</span>
        </div>

        {/* 수사대장의 다음 안내 */}
        <div className="mb-5 flex items-start gap-2">
          <div className="df-chief-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg">
            🎖️
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 text-[11px] font-medium text-muted-foreground">
              {intro.chiefName}
            </div>
            <div className="df-bubble-chief rounded-2xl px-3 py-2 text-sm leading-relaxed">
              {midResult.chiefLine}
            </div>
          </div>
        </div>

        <button
          onClick={game.startCases}
          className="df-btn-cta flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-base font-bold"
        >
          {midResult.nextLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}

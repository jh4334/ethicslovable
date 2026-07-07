import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Lightbulb } from "lucide-react";
import type { DfContent } from "../types";

interface StartScreenProps {
  content: DfContent;
  onStart: () => void;
}

/** 시작 화면 — 수사대장이 오늘의 수사(눈 시험 → 검증 수사)를 소개한다 */
export default function StartScreen({ content, onStart }: StartScreenProps) {
  const { intro } = content;
  const reduce = useReducedMotion();

  return (
    <div className="df-shell flex min-h-[calc(100vh-3rem)] items-center justify-center p-4">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mlq-card w-full max-w-md p-6"
      >
        {/* 수사대 배지 + 제목 */}
        <div className="mb-4 text-center">
          <div className="mlq-emoji-tile df-hero-tile mx-auto mb-3 flex h-20 w-20 animate-float text-4xl">
            🕵️
          </div>
          <div className="mlq-chip mb-1.5 bg-warning/15 text-warning-foreground">
            <BadgeCheck className="h-3.5 w-3.5" />
            {intro.badge}
          </div>
          <h1 className="df-gradient-text text-3xl font-black">{intro.title}</h1>
          <p className="mt-1 text-sm font-bold text-muted-foreground">{intro.tagline}</p>
        </div>

        {/* 수사대장 대사 */}
        <div className="mb-4 space-y-2">
          {intro.chiefLines.map((line, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="df-chief-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg">
                🎖️
              </div>
              <div className="min-w-0">
                {i === 0 && (
                  <div className="mb-0.5 text-[11px] font-medium text-muted-foreground">
                    {intro.chiefName}
                  </div>
                )}
                <div className="df-bubble-chief rounded-2xl px-3 py-2 text-sm leading-relaxed">
                  {line}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 딥페이크 개념 한 줄 */}
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs leading-relaxed">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <span>{intro.deepfakeNote}</span>
        </div>

        {/* 오늘의 수사 계획 (1부·2부) */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          {intro.plan.map((p) => (
            <div key={p.step} className="df-plan-card rounded-xl p-3">
              <div className="mb-1 text-[11px] font-black text-warning-foreground/70">{p.step}</div>
              <div className="text-sm font-extrabold">{p.title}</div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="df-btn-cta w-full rounded-xl py-3 text-base font-bold"
        >
          {intro.startLabel}
        </button>
      </motion.div>
    </div>
  );
}

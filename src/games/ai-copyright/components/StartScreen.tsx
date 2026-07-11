import { motion } from "framer-motion";
import { Scale, Sparkles, BookOpenCheck } from "lucide-react";
import type { AcContent } from "../types";

interface StartScreenProps {
  content: AcContent;
  onStart: () => void;
}

/** 시작 화면 — 창작 심판 소개 + 미션 안내 */
export default function StartScreen({ content, onStart }: StartScreenProps) {
  const { intro, round1, makeRight, principles } = content;

  return (
    <div className="ac-shell flex min-h-[calc(100vh-3rem)] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mlq-card w-full max-w-md p-6"
      >
        <div className="mb-4 flex flex-col items-center gap-3">
          <div className="mlq-emoji-tile ac-hero-tile flex h-20 w-20 shrink-0 animate-float text-4xl">
            ⚖️
          </div>
          <div className="ac-portal rounded-2xl p-3 text-sm leading-relaxed text-foreground">
            {intro.greeting}
          </div>
        </div>

        <div className="mb-4 text-center">
          <div className="mlq-chip mb-1.5 bg-primary/10 text-primary">
            <Scale className="h-3.5 w-3.5" />
            {intro.role}
          </div>
          <h1 className="ac-gradient-text text-2xl font-black">{intro.title}</h1>
        </div>

        <p className="mb-3 rounded-xl bg-secondary p-3 text-sm leading-relaxed text-secondary-foreground">
          {intro.mission}
        </p>

        <div className="mb-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs leading-relaxed text-foreground">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <span>{intro.tip}</span>
        </div>

        <div className="mb-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <BookOpenCheck className="h-4 w-4 shrink-0" />
          <span>
            판단 {round1.length}상황 · 바르게 만들기 {makeRight.length}상황 · 책임 원칙{" "}
            {principles.length}개
          </span>
        </div>

        <button
          onClick={onStart}
          className="ac-btn-cta w-full rounded-xl py-3 text-base font-bold text-white"
        >
          {intro.startLabel}
        </button>
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, BookOpenCheck } from "lucide-react";
import type { FcContent } from "../types";

interface StartScreenProps {
  content: FcContent;
  onStart: () => void;
}

export default function StartScreen({ content, onStart }: StartScreenProps) {
  const { intro, rules } = content;

  return (
    <div className="fc-shell flex min-h-[calc(100vh-2.75rem)] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mlq-card w-full max-w-md p-6"
      >
        {/* 누리봇 히어로 + 인사 */}
        <div className="mb-4 flex flex-col items-center gap-3">
          <div className="mlq-emoji-tile fc-hero-tile flex h-20 w-20 shrink-0 animate-float text-4xl">
            🤖
          </div>
          <div className="fc-bubble-bot rounded-2xl p-3 text-sm leading-relaxed text-foreground">
            {intro.nuribotIntro}
          </div>
        </div>

        <div className="mb-4 text-center">
          <div className="mlq-chip mb-1.5 bg-primary/10 text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            {intro.role}
          </div>
          <h1 className="fc-gradient-text text-2xl font-black">{intro.title}</h1>
        </div>

        <p className="mb-3 rounded-xl bg-secondary p-3 text-sm leading-relaxed text-secondary-foreground">
          {intro.mission}
        </p>

        <div className="mb-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs leading-relaxed text-foreground">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <span>{intro.tip}</span>
        </div>

        <div className="mb-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <BookOpenCheck className="h-4 w-4" />
          <span>총 {rules.totalRounds}라운드 · 정확히 검증하면 라운드마다 +{rules.pointsPerCorrect}점</span>
        </div>

        <button
          onClick={onStart}
          className="fc-btn-cta w-full rounded-xl py-3 text-base font-bold text-white"
        >
          {intro.startLabel}
        </button>
      </motion.div>
    </div>
  );
}

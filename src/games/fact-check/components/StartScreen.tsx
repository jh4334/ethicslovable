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
        className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg"
      >
        {/* 누리봇 인사 */}
        <div className="mb-4 flex items-start gap-3">
          <div className="fc-bot-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl">
            🤖
          </div>
          <div className="fc-bubble-bot rounded-2xl p-3 text-sm leading-relaxed text-foreground">
            {intro.nuribotIntro}
          </div>
        </div>

        <div className="mb-4 text-center">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            {intro.role}
          </div>
          <h1 className="text-xl font-black">{intro.title}</h1>
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
          className="w-full rounded-xl bg-primary py-3 text-base font-bold text-primary-foreground shadow transition hover:brightness-105 active:scale-[0.99]"
        >
          {intro.startLabel}
        </button>
      </motion.div>
    </div>
  );
}

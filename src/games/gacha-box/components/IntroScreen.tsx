import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import type { GbContent } from "../types";

interface IntroScreenProps {
  content: GbContent;
  onStart: () => void;
}

/** 임무 브리핑 — 지킴이에게 뽑기 상자 조사 임무를 준다 */
export default function IntroScreen({ content, onStart }: IntroScreenProps) {
  const { intro } = content;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center"
      >
        <span className="gb-pill text-[11px]">{intro.badge}</span>
        <div className="mt-4 flex justify-center">
          <span
            className="mlq-emoji-tile h-20 w-20 animate-float text-5xl"
            style={{ "--tile-hue": 45 } as CSSProperties}
            aria-hidden
          >
            🎁
          </span>
        </div>
        <h1 className="mt-4 text-2xl font-black">{intro.title}</h1>
        <p className="mt-1.5 text-sm font-bold text-muted-foreground">{intro.tagline}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mlq-card mt-6 space-y-3 p-5"
      >
        {intro.paragraphs.map((paragraph, i) => (
          <p key={i} className="text-sm leading-relaxed text-foreground/90">
            {paragraph}
          </p>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="gb-callout mt-4 rounded-2xl p-4"
      >
        <h2 className="text-xs font-extrabold text-foreground/80">🗒️ 오늘의 조사 목표</h2>
        <ul className="mt-2 space-y-1.5">
          {intro.missions.map((mission, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-bold">
              <span className="gb-grad-text shrink-0">{i + 1}.</span>
              <span>{mission}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        type="button"
        onClick={onStart}
        className="gb-btn mt-6 w-full px-6 py-3.5 text-base"
      >
        {intro.startButton}
      </motion.button>
    </div>
  );
}

import { motion } from "framer-motion";
import type { FeedAlgorithmContent } from "./types";

interface IntroScreenProps {
  content: FeedAlgorithmContent;
  onStart: () => void;
}

/** 게임 시작 전 도입 화면 */
const IntroScreen = ({ content, onStart }: IntroScreenProps) => {
  const { intro, stats } = content;

  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center space-y-6 overflow-y-auto p-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-6xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        {intro.emoji}
      </motion.div>

      <h1 className="fa-title text-4xl font-black leading-tight tracking-tight">
        {intro.title}
        <br />
        <span className="fa-accent mt-2 inline-block text-lg font-semibold tracking-normal [text-shadow:none]">
          {intro.subtitle}
        </span>
      </h1>

      <div className="fa-panel fa-dim w-full max-w-sm p-5 text-left text-sm leading-relaxed">
        <p className="mb-3 break-keep text-white/90">{intro.paragraphs[0]}</p>
        <p className="mb-1 font-bold text-amber-400">{intro.warning}</p>
        <p className="mb-4 break-keep">{intro.paragraphs[1]}</p>

        {/* 네 가지 수치 소개 */}
        <ul className="mb-3 space-y-1.5 text-xs">
          {stats.map((stat) => (
            <li key={stat.key} className="break-keep">
              <span className="font-bold text-white/90">
                {stat.icon} {stat.label}
              </span>{" "}
              — {stat.description}
            </li>
          ))}
        </ul>

        <p className="fa-accent break-keep text-xs font-bold">{intro.rule}</p>
      </div>

      <motion.button
        onClick={onStart}
        className="fa-btn fa-btn-primary w-full max-w-xs py-4"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {intro.startButton}
      </motion.button>
    </motion.div>
  );
};

export default IntroScreen;

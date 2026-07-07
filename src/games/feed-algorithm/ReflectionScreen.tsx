import { motion } from "framer-motion";
import type { FeedAlgorithmContent } from "./types";

interface ReflectionScreenProps {
  content: FeedAlgorithmContent;
  onRestart: () => void;
}

/** 교육적 성찰 + 디지털 방어 수칙 화면 */
const ReflectionScreen = ({ content, onRestart }: ReflectionScreenProps) => {
  const { reflection } = content;

  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center overflow-y-auto p-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-white break-keep">
        {reflection.title}
      </h1>

      <div className="fa-dim max-w-sm space-y-4 text-sm leading-relaxed">
        {reflection.paragraphs.map((paragraph, i) => (
          <p key={i} className="break-keep">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="fa-panel mt-8 w-full max-w-xs p-4">
        <h3 className="fa-accent mb-3 text-sm font-bold">{reflection.rulesTitle}</h3>
        <ul className="fa-dim list-disc space-y-2 pl-4 text-left text-xs">
          {reflection.rules.map((rule, i) => (
            <li key={i} className="break-keep">
              {rule}
            </li>
          ))}
        </ul>
      </div>

      <motion.button
        onClick={onRestart}
        className="fa-btn fa-btn-ghost mt-8 px-8 py-3"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {reflection.restartButton}
      </motion.button>
    </motion.div>
  );
};

export default ReflectionScreen;

import { motion } from "framer-motion";
import type { FeedAlgorithmContent } from "./types";

interface DragTutorialProps {
  tutorial: FeedAlgorithmContent["tutorial"];
  onDismiss: () => void;
}

/** 처음 플레이할 때 한 번 보여주는 드래그 안내 오버레이 */
const DragTutorial = ({ tutorial, onDismiss }: DragTutorialProps) => {
  return (
    <motion.div
      className="fa-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
    >
      <div className="relative flex flex-col items-center px-8 text-center">
        {/* 좌우 안내 + 손가락 애니메이션 */}
        <div className="relative mb-6 h-32 w-64">
          <motion.div
            className="absolute left-0 top-1/2 flex -translate-y-1/2 flex-col items-center"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-2xl font-bold text-white">{tutorial.leftLabel}</span>
            <span className="fa-dim mt-1 text-xs">{tutorial.leftDesc}</span>
          </motion.div>

          <motion.div
            className="absolute right-0 top-1/2 flex -translate-y-1/2 flex-col items-center"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <span className="text-2xl font-bold text-white">{tutorial.rightLabel}</span>
            <span className="fa-dim mt-1 text-xs">{tutorial.rightDesc}</span>
          </motion.div>

          <motion.div
            className="absolute left-1/2 top-1/2 -translate-y-1/2 text-5xl"
            animate={{ x: [-60, 60, -60] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          >
            👆
          </motion.div>
        </div>

        {/* 흔들리는 카드 모형 */}
        <motion.div
          className="fa-panel mb-6 flex h-20 w-32 items-center justify-center border-dashed"
          animate={{ x: [-30, 30, -30], rotate: [-5, 5, -5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <span className="text-3xl">📱</span>
        </motion.div>

        <p className="mb-2 text-lg font-extrabold tracking-tight text-white">{tutorial.heading}</p>
        <p className="fa-dim mb-6 text-sm">{tutorial.body}</p>

        <motion.button
          className="fa-btn fa-btn-primary px-6 py-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDismiss}
        >
          {tutorial.dismissButton}
        </motion.button>

        <p className="fa-dim mt-4 text-xs">{tutorial.hint}</p>
      </div>
    </motion.div>
  );
};

export default DragTutorial;

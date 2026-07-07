import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { markCompleted } from "@/lib/progress";
import { analyzePlayStyle, buildSummary } from "./logic";
import type { EndingInfo, FeedAlgorithmContent, GameLogEntry, Stats } from "./types";

interface ResultScreenProps {
  content: FeedAlgorithmContent;
  ending: EndingInfo;
  day: number;
  stats: Stats;
  log: GameLogEntry[];
  onContinue: () => void;
}

/** 엔딩 + 관리자 리포트 + 선택 기록을 보여주는 결과 화면 */
const ResultScreen = ({ content, ending, day, stats, log, onContinue }: ResultScreenProps) => {
  const style = content.playStyles[analyzePlayStyle(stats)];
  const completedRef = useRef(false);

  // 결과 화면에 도달하면 학습 완료로 기록한다(중복 호출 방지).
  useEffect(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    markCompleted("feed-algorithm", buildSummary(content, ending.survived, day, stats, ending.title));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="flex h-full flex-col items-center overflow-y-auto p-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-3 mt-6 text-5xl" aria-hidden="true">
        {ending.emoji}
      </div>
      <p className="fa-dim mb-1 text-xs font-bold">
        {ending.survived ? content.result.survivalHeading : content.result.gameOverHeading} ·{" "}
        {day}일차까지 운영
      </p>

      {/* 엔딩 제목/설명 — 항상 크게 보여준다 */}
      <h1 className="mb-2 text-2xl font-black break-keep">{ending.title}</h1>
      <p className="fa-dim mb-6 max-w-sm text-sm leading-relaxed break-keep">{ending.desc}</p>

      <div className="fa-panel mb-6 w-full max-w-sm p-6">
        <h2 className="fa-accent mb-2 text-lg font-bold">{content.result.reportTitle}</h2>
        <p className="mb-1 text-xs font-bold text-white/80">
          {style.emoji} 플레이 성향: {style.label}
        </p>
        <p className="fa-dim mb-4 text-sm leading-relaxed break-keep">{style.report}</p>

        <div className="fa-divider my-4" />

        <div className="space-y-3 text-left text-xs">
          <p className="fa-dim mb-2 font-bold">{content.result.logTitle}</p>
          <div className="fa-scroll space-y-3 pr-1">
            {log.map((entry, i) => (
              <div key={i} className="flex gap-2 border-b border-white/10 pb-2 last:border-0">
                <span className="fa-accent shrink-0 font-bold">{entry.day}일차</span>
                <span className="fa-dim break-keep">{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        onClick={onContinue}
        className="fa-btn fa-btn-light w-full max-w-xs py-4"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {content.result.continueButton}
      </motion.button>
    </motion.div>
  );
};

export default ResultScreen;

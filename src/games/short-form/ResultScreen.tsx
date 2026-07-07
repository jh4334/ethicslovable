/**
 * 결과 화면 — 지킴이 조사 보고서.
 * 총 시청 영상·가상 시간·퀴즈 오차·멈추기 결과 + 지킴이 등급 + 실천 팁 3가지.
 * 도착 시 markCompleted를 한 번만 기록한다(StrictMode 이중 실행 대비 ref 가드).
 */
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { markCompleted } from "@/lib/progress";
import { computeScore, fill, formatVirtual, pickGrade } from "./logic";
import type { SfContent } from "./types";
import type { ShortFormGame } from "./useShortFormGame";

interface ResultScreenProps {
  content: SfContent;
  game: ShortFormGame;
}

export default function ResultScreen({ content, game }: ResultScreenProps) {
  const { result, grades } = content;
  const { stats, outcome, restart } = game;
  const kind = outcome ?? "forced";

  const timeLabel = formatVirtual(stats.virtualSec);
  const grade = pickGrade(grades, computeScore(kind, stats));

  // 학습 기록은 한 번만 저장 (StrictMode 이중 실행 대비)
  const markedRef = useRef(false);
  useEffect(() => {
    if (markedRef.current) return;
    markedRef.current = true;
    markCompleted(
      "short-form",
      fill(result.summaryTemplate, { 시간: timeLabel, 멈춤: result.summaryStop[kind] }),
    );
  }, [result, timeLabel, kind]);

  const statItems = [
    { label: result.statVideos, value: `${stats.watched}개` },
    { label: result.statTime, value: timeLabel },
    {
      label: result.statQuiz,
      value: fill(result.quizErrorTemplate, { 오차: stats.totalErrorMin }),
    },
    { label: result.statStop, value: result.stopLabels[kind] },
  ];

  return (
    <div className="sf-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mlq-card w-full max-w-xl p-6 sm:p-8"
      >
        <h2 className="text-center text-2xl font-extrabold">📋 {result.title}</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">{result.subtitle}</p>

        {/* 지킴이 등급 */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
          className="sf-grade mt-5 px-5 py-4 text-center"
        >
          <span aria-hidden className="text-4xl">
            {grade.emoji}
          </span>
          <p className="mt-1 text-lg font-black">{grade.name}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/80">{grade.line}</p>
        </motion.div>

        {/* 조사 수치 */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="sf-stat px-3 py-3 text-center"
            >
              <p className="text-[11px] font-bold text-muted-foreground">{item.label}</p>
              <p className="sf-stat-value mt-0.5 text-lg font-black">{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* 핵심 배움 */}
        <div className="sf-core-note mt-5 rounded-xl px-4 py-3">
          <p className="text-center text-sm font-extrabold leading-relaxed">
            {result.coreMessage}
          </p>
        </div>

        {/* 실천 팁 3가지 */}
        <p className="mt-6 text-sm font-extrabold">✅ {result.tipsTitle}</p>
        <ul className="mt-2 space-y-2">
          {result.tips.map((tip) => (
            <li key={tip.title} className="sf-tip flex items-start gap-3 p-3">
              <span aria-hidden className="mlq-emoji-tile sf-reveal-tile h-10 w-10 shrink-0 text-xl">
                {tip.emoji}
              </span>
              <div>
                <p className="text-sm font-bold">{tip.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{tip.line}</p>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={restart}
          className="sf-btn sf-btn-outline mt-6 w-full px-6 py-3 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          {result.restartButton}
        </button>
      </motion.div>
    </div>
  );
}

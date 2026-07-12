import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Medal, PencilLine, RotateCcw, ScrollText, Sparkles, Star, Trophy } from "lucide-react";
import { markCompleted } from "@/lib/progress";
import NextQuest from "@/components/NextQuest";
import { cn } from "@/lib/utils";
import type { ClearContent, FinalReportContent, GradeContent } from "./types";

interface ClearScreenProps {
  totalScore: number;
  levelScores: number[];
  grades: GradeContent[];
  clear: ClearContent;
  /** (선택) 연구소장의 최종 보고서 — 콘텐츠 JSON 에서 지우면 표시되지 않는다 */
  finalReport?: FinalReportContent;
  onReset: () => void;
}

/** 점수에 맞는 등급 찾기 — minScore 가 높은 등급부터 검사 */
function getGrade(grades: GradeContent[], score: number): GradeContent {
  const sorted = [...grades].sort((a, b) => b.minScore - a.minScore);
  return sorted.find((g) => score >= g.minScore) ?? sorted[sorted.length - 1];
}

/** 반짝이 장식 위치 — 렌더마다 바뀌지 않게 고정 계산 (StrictMode 안전) */
const SPARKLES = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  size: 16 + ((i * 29) % 16),
  delay: (i % 7) * 0.3,
  repeatDelay: (i % 5) * 0.6,
}));

const GRADE_CLASSES: Record<string, string> = {
  S: "tt-grade-s",
  A: "tt-grade-a",
  B: "tt-grade-b",
  C: "tt-grade-c",
  D: "tt-grade-d",
};

/** 5레벨 클리어 후 최종 결과 화면 */
export default function ClearScreen({ totalScore, levelScores, grades, clear, finalReport, onReset }: ClearScreenProps) {
  // 교사가 JSON 에서 항목을 지웠을 수도 있으니 방어적으로 확인한다
  const hasReport = Boolean(
    finalReport &&
      Array.isArray(finalReport.paragraphs) &&
      finalReport.paragraphs.length > 0 &&
      Array.isArray(finalReport.questions) &&
      finalReport.questions.length > 0
  );
  const { grade, message } = getGrade(grades, totalScore);
  const gradeClass = GRADE_CLASSES[grade] ?? "tt-grade-d";

  // 게임 완료를 학습 기록에 한 번만 저장 (markCompleted 자체가 덮어쓰기라 중복 호출도 안전)
  const marked = useRef(false);
  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    markCompleted("trend-tycoon", `최종 등급 ${grade} · 총점 ${totalScore.toLocaleString()}점`);
  }, [grade, totalScore]);

  return (
    <div className="tt-clear-bg relative flex min-h-[calc(100vh-2.75rem)] flex-col items-center justify-center overflow-hidden p-6">
      {/* 배경 반짝이 */}
      <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {SPARKLES.map((s, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: s.left, top: s.top }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, delay: s.delay, repeat: Infinity, repeatDelay: s.repeatDelay }}
          >
            <Sparkles className="text-white/40" size={s.size} aria-hidden />
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", duration: 0.8 }}>
        <Trophy size={100} className="mb-6 text-yellow-300 drop-shadow-2xl" aria-hidden />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4 text-center text-4xl font-black tracking-tight drop-shadow-md md:text-5xl"
      >
        {clear.title}
      </motion.h1>

      {/* 등급·점수 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="tt-glass-card mb-6 rounded-2xl p-6 text-center"
      >
        <div className="mb-3 flex items-center justify-center gap-3">
          <Medal size={36} className={cn(gradeClass, "drop-shadow-lg")} aria-hidden />
          <span className={cn("tt-grade-hero text-7xl font-black md:text-8xl", gradeClass)}>{grade}</span>
        </div>
        <p className="mb-4 text-sm font-semibold text-white/85">{message}</p>

        <div className="mb-4 flex items-center justify-center gap-2">
          <Star size={20} className="fill-current text-yellow-300 drop-shadow" aria-hidden />
          <span className="text-3xl font-extrabold tabular-nums drop-shadow-sm">{totalScore.toLocaleString()}점</span>
        </div>

        {/* 레벨별 점수 */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {levelScores.map((score, idx) => (
            <div key={idx} className="tt-level-score-card rounded-xl p-2 text-center">
              <div className="text-xs font-semibold text-white/65">{idx + 1}레벨</div>
              <div className="text-sm font-extrabold tabular-nums">{score.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-6 max-w-lg text-center text-lg text-white/90"
      >
        {clear.message.split("\n").map((line, idx) => (
          <span key={idx}>
            {idx > 0 && <br />}
            {line}
          </span>
        ))}
      </motion.p>

      {/* 연구소장의 최종 보고서 — 배움 정리 + 학습지 연계 질문 */}
      {hasReport && finalReport && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="tt-final-report tt-glass-card z-10 mb-8 w-full max-w-2xl rounded-2xl p-5 text-left md:p-6"
          aria-label={finalReport.title}
        >
          <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <ScrollText size={22} className="shrink-0 text-yellow-300" aria-hidden />
            {finalReport.title}
          </h2>

          <div className="mb-4 space-y-2.5">
            {finalReport.paragraphs.map((paragraph, idx) => (
              <p key={idx} className="text-sm leading-relaxed text-white/90">
                {paragraph}
              </p>
            ))}
          </div>

          {/* 되돌아보기 질문 — 학습지에 답을 적는다 */}
          <div className="tt-report-questions rounded-xl border border-white/15 bg-white/15 p-4">
            <ol className="list-decimal space-y-2 pl-5 text-sm font-semibold leading-relaxed">
              {finalReport.questions.map((question, idx) => (
                <li key={idx}>{question}</li>
              ))}
            </ol>
            {finalReport.worksheetNote && (
              <p className="mt-3 flex items-center gap-1.5 border-t border-white/20 pt-3 text-sm font-bold text-yellow-200">
                <PencilLine size={16} className="shrink-0" aria-hidden />
                {finalReport.worksheetNote}
              </p>
            )}
          </div>
        </motion.section>
      )}

      <div className="z-10 mb-4 w-full max-w-sm">
        <NextQuest gameId="trend-tycoon" />
      </div>

      <motion.button
        onClick={onReset}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="z-10 flex items-center gap-2 rounded-full bg-white px-8 py-3 text-lg font-extrabold text-foreground shadow-2xl"
      >
        <RotateCcw aria-hidden /> {clear.restartLabel}
      </motion.button>
    </div>
  );
}

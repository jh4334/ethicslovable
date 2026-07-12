import { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Home, PencilLine, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { markCompleted } from "@/lib/progress";
import NextQuest from "@/components/NextQuest";
import type { DfContent } from "../types";
import type { DeepfakeGame } from "../useDeepfakeGame";

interface ResultScreenProps {
  content: DfContent;
  game: DeepfakeGame;
}

/**
 * 결과 화면 — 눈(N/5) vs 검증(M/4) 비교 막대, 4단계 검증 수칙,
 * 수사대 등급. 결론: 믿을 것은 눈이 아니라 절차.
 */
export default function ResultScreen({ content, game }: ResultScreenProps) {
  const { result, grades, verificationRules } = content;
  const { eyeScore, totalEyeRounds, verifyScore, totalCases, caseScore } = game;
  const reduce = useReducedMotion();

  const eyePct = Math.round((eyeScore / totalEyeRounds) * 100);
  const verifyPct = Math.round((verifyScore / totalCases) * 100);

  // 2부 점수에 맞는 가장 높은 등급을 고른다
  const grade = useMemo(() => {
    const sorted = [...grades].sort((a, b) => a.min - b.min);
    let chosen = sorted[0];
    for (const g of sorted) if (caseScore >= g.min) chosen = g;
    return chosen;
  }, [grades, caseScore]);

  // 결과 화면에 도착하면 학습 완료로 한 번만 기록 (StrictMode 안전)
  const reportedRef = useRef(false);
  useEffect(() => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    markCompleted(
      "deepfake",
      `눈 ${eyeScore}/${totalEyeRounds} → 검증 ${verifyScore}/${totalCases} · ${grade.name} 등급`,
    );
  }, [eyeScore, totalEyeRounds, verifyScore, totalCases, grade.name]);

  return (
    <div className="df-shell flex min-h-[calc(100vh-3rem)] items-center justify-center p-4">
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mlq-card w-full max-w-md p-6"
      >
        <div className="mb-2 text-center text-xs font-bold text-muted-foreground">
          {result.title}
        </div>

        {/* 수사대 등급 */}
        <div className="df-emblem mx-auto mb-3">
          <span>{grade.emoji}</span>
        </div>
        <div className="text-center text-[11px] font-bold text-muted-foreground">
          {result.gradeLabel} · {caseScore}점
        </div>
        <h2 className="df-gradient-text text-center text-2xl font-black">{grade.name}</h2>
        <p className="mt-1 text-center text-sm leading-relaxed text-muted-foreground">
          {grade.desc}
        </p>

        {/* 눈 vs 검증 비교 그래프 */}
        <div className="my-5">
          <h3 className="mb-2 text-sm font-extrabold">📊 {result.compareTitle}</h3>
          <div className="space-y-2.5">
            <div>
              <div className="mb-1 flex justify-between text-xs font-bold">
                <span className="text-muted-foreground">👀 {result.eyeBarLabel}</span>
                <span>
                  {eyeScore}/{totalEyeRounds}
                </span>
              </div>
              <div className="df-bar-track">
                <div className="df-bar-fill df-bar-eye" style={{ width: `${Math.max(eyePct, 12)}%` }}>
                  {eyePct}%
                </div>
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs font-bold">
                <span className="text-muted-foreground">🧰 {result.verifyBarLabel}</span>
                <span>
                  {verifyScore}/{totalCases}
                </span>
              </div>
              <div className="df-bar-track">
                <div
                  className="df-bar-fill df-bar-verify"
                  style={{ width: `${Math.max(verifyPct, 12)}%` }}
                >
                  {verifyPct}%
                </div>
              </div>
            </div>
          </div>
          <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
            {result.compareNote}
          </p>
        </div>

        {/* 4단계 검증 수칙 */}
        <h3 className="mb-2 text-sm font-extrabold">✅ {result.rulesTitle}</h3>
        <div className="mb-2.5 space-y-2">
          {verificationRules.map((rule, i) => (
            <div key={i} className="df-rule-card flex items-start gap-2 p-3">
              <span className="df-rule-num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                {i + 1}
              </span>
              <div className="min-w-0 text-sm leading-relaxed">
                <span className="font-extrabold">
                  {rule.emoji} {rule.title}
                </span>
                <span className="text-foreground/80"> — {rule.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 학습지 옮겨 적기 안내 */}
        <div className="df-worksheet-note mb-4 flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed">
          <PencilLine className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <span>{result.worksheetNote}</span>
        </div>

        {/* 마무리 메시지 */}
        <div className="df-reveal-card mb-5 rounded-2xl p-4 text-center">
          <div className="text-sm font-black">{result.finalTitle}</div>
          <p className="mt-1 text-sm leading-relaxed">{result.finalMessage}</p>
        </div>

        <div className="mb-3">
          <NextQuest gameId="deepfake" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={game.restart}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary py-3 text-sm font-bold text-secondary-foreground transition hover:brightness-95"
          >
            <RotateCcw className="h-4 w-4" />
            {result.retryButton}
          </button>
          <Link
            to="/"
            className="df-btn-cta flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold"
          >
            <Home className="h-4 w-4" />
            {result.homeButton}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

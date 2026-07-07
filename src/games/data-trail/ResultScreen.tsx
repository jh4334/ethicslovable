/**
 * 결과 화면 — 데이터 방패 수 + 프로필 카드 다시 보기 + 핵심 배움 문구.
 * 도착 시 markCompleted를 한 번만 기록한다(StrictMode 이중 실행 대비 ref 가드).
 */
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { markCompleted } from "@/lib/progress";
import { cn } from "@/lib/utils";
import ProfileCard from "./ProfileCard";
import type { DtContent } from "./types";
import type { DataTrailGame } from "./useDataTrailGame";

interface ResultScreenProps {
  content: DtContent;
  game: DataTrailGame;
}

export default function ResultScreen({ content, game }: ResultScreenProps) {
  const { result } = content;
  const { shields, analysis, restart } = game;
  const totalShields = content.protect.scenarios.length;

  // 학습 기록은 한 번만 저장 (StrictMode 이중 실행 대비)
  const markedRef = useRef(false);
  useEffect(() => {
    if (markedRef.current) return;
    markedRef.current = true;
    markCompleted("data-trail", result.summaryTemplate.replace("{개수}", String(shields)));
  }, [shields, result.summaryTemplate]);

  const shieldMessage =
    [...result.shieldMessages]
      .sort((a, b) => b.min - a.min)
      .find((m) => shields >= m.min)?.text ?? "";

  return (
    <div className="dt-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl rounded-2xl bg-card p-6 shadow-lg sm:p-8"
      >
        <h2 className="text-center text-2xl font-extrabold">🎉 {result.title}</h2>

        {/* 방패 결과 */}
        <p className="mt-5 text-center text-sm font-bold">{result.shieldTitle}</p>
        <div className="mt-2 flex justify-center gap-2">
          {Array.from({ length: totalShields }, (_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 + i * 0.12, type: "spring", stiffness: 300 }}
              className={cn(
                "dt-shield-slot",
                i < shields ? "dt-shield-slot-filled" : "dt-shield-slot-empty",
              )}
            >
              {i < shields ? "🛡️" : "·"}
            </motion.span>
          ))}
        </div>
        <p className="mt-1.5 text-center text-sm font-bold">
          {shields}개 / {totalShields}개
        </p>
        <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
          {shieldMessage}
        </p>

        {/* 프로필 카드 다시 보기 */}
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          {result.profileRevisit}
        </p>
        <div className="mt-2">
          <ProfileCard content={content} profile={analysis.profile} />
        </div>

        {/* 핵심 배움 */}
        <div className="dt-shadow-note mt-5 rounded-xl px-4 py-3">
          <p className="text-center text-sm font-extrabold leading-relaxed">
            {result.coreMessage}
          </p>
        </div>

        <button
          type="button"
          onClick={restart}
          className="dt-btn dt-btn-outline mt-6 w-full px-6 py-3 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          {result.restartButton}
        </button>
      </motion.div>
    </div>
  );
}

/**
 * 체험 종료 화면 — 멈추기 챌린지 결과에 따라 3가지 얼굴.
 * early: 성공 배지 / late: 늦었지만 성공 / forced: 강제 종료("멈추기, 생각보다 어렵죠?")
 */
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { fill, formatVirtual } from "./logic";
import type { SfContent } from "./types";
import type { ShortFormGame } from "./useShortFormGame";

interface EndScreenProps {
  content: SfContent;
  game: ShortFormGame;
}

export default function EndScreen({ content, game }: EndScreenProps) {
  const { stopChallenge } = content;
  const { outcome, stats, goReveal } = game;
  const kind = outcome ?? "forced";

  const face =
    kind === "early"
      ? { emoji: "🏅", title: stopChallenge.earlyTitle, line: stopChallenge.earlyLine }
      : kind === "late"
        ? { emoji: "😮‍💨", title: stopChallenge.lateTitle, line: stopChallenge.lateLine }
        : { emoji: "🔌", title: stopChallenge.forcedTitle, line: stopChallenge.forcedLine };

  return (
    <div className="sf-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="mlq-card w-full max-w-md p-6 text-center sm:p-8"
      >
        <motion.span
          aria-hidden
          initial={{ scale: 0, rotate: -16 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260 }}
          className="mlq-emoji-tile sf-hero-tile mx-auto h-20 w-20 text-5xl"
        >
          {face.emoji}
        </motion.span>

        {kind === "early" && (
          <p className="sf-badge mx-auto mt-4 inline-flex rounded-full px-4 py-1.5 text-sm font-black">
            {stopChallenge.earlyBadge}
          </p>
        )}

        <h2 className="mt-3 text-2xl font-extrabold">{face.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{face.line}</p>

        {/* 여기서 처음으로 시계가 공개된다 */}
        <p className="sf-promise mx-auto mt-5 rounded-xl px-4 py-3 text-sm font-bold">
          {fill(stopChallenge.watchedTemplate, {
            영상수: stats.watched,
            시간: formatVirtual(stats.virtualSec),
            약속: content.rules.promiseMinutes,
          })}
        </p>

        <button
          type="button"
          onClick={goReveal}
          className="sf-btn sf-btn-primary mt-6 w-full px-6 py-3 text-base"
        >
          <Search className="h-4 w-4" />
          {stopChallenge.reviewButton}
        </button>
      </motion.div>
    </div>
  );
}

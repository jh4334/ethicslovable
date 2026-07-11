import { motion } from "framer-motion";
import type { AfContent } from "../types";
import type { AiFairGame } from "../useAiFairGame";

interface InsightScreenProps {
  content: AfContent;
  game: AiFairGame;
}

/**
 * 통찰 — 6/6 달성 뒤. "왜 처음엔 2명만 됐을까?"(평균적인 사람만 생각한 설계)와
 * 장벽↔개선 정리를 보여 준다. 세부원칙 6(취약계층 동등 접근)을 명시한다.
 */
export default function InsightScreen({ content, game }: InsightScreenProps) {
  const { insight, barriers, users } = content;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="af-callout af-bounce-in rounded-2xl p-5 text-center">
          <div className="text-4xl" aria-hidden>
            💡
          </div>
          <h2 className="mt-1 text-lg font-black">{insight.title}</h2>
        </div>

        {/* 왜 처음엔 2명만? */}
        <div className="mlq-card mt-4 p-4">
          <h3 className="af-grad-text text-sm font-black">{insight.whyTitle}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{insight.whyText}</p>
        </div>

        {/* 장벽 ↔ 개선 정리 */}
        <div className="mt-4">
          <h3 className="text-sm font-extrabold">🗺️ {insight.mapTitle}</h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {insight.summaryLead}
          </p>
          <div className="mt-2 grid gap-2">
            {barriers.map((barrier, i) => {
              const friend = users.find((u) => u.barrierId === barrier.id);
              const fixes = game.equippedCards.filter((c) =>
                c.helpsBarrierIds.includes(barrier.id),
              );
              return (
                <motion.div
                  key={barrier.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="rounded-2xl border bg-card p-3"
                >
                  <div className="flex items-center gap-2">
                    {friend && (
                      <span className="mlq-emoji-tile h-9 w-9 shrink-0 text-lg" aria-hidden>
                        {friend.emoji}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-extrabold">
                        {barrier.emoji} {barrier.name}
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground">
                        {barrier.principle}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t pt-2">
                    <span className="text-[11px] font-bold text-foreground/70">고친 개선 →</span>
                    {fixes.map((f) => (
                      <span
                        key={f.id}
                        className="af-tag-on rounded-full px-2 py-0.5 text-[11px] font-bold"
                      >
                        {f.emoji} {f.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 마무리 문장 (세부원칙 6) */}
        <div className="af-callout mt-4 rounded-2xl p-4">
          <p className="text-sm leading-relaxed text-foreground/90">🤝 {insight.closing}</p>
        </div>

        <button
          type="button"
          onClick={game.goResult}
          className="af-btn mt-5 w-full px-6 py-3 text-sm"
        >
          {insight.toResultButton}
        </button>
      </motion.div>
    </div>
  );
}

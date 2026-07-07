import { motion } from "framer-motion";
import { CheckCircle2, XCircle, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SdClue, SdContent, SdRound, SdVerdict } from "../types";

interface VerdictPanelProps {
  content: SdContent;
  round: SdRound;
  verdict: SdVerdict;
  clueById: Map<string, SdClue>;
}

/** 판정 배너 + 해설 + 이번 라운드 대표 단서(도감 수집) */
export default function VerdictPanel({ content, round, verdict, clueById }: VerdictPanelProps) {
  const { labels } = content;
  const focusClue = clueById.get(round.focusClueId);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
      {/* 판정 배너 */}
      <div
        className={cn(
          "mb-2 flex items-center gap-1.5 rounded-xl px-3 py-2 pr-10 text-sm font-bold",
          verdict.correct
            ? "sd-verdict-correct text-success"
            : "sd-verdict-wrong text-destructive",
        )}
      >
        {verdict.correct ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 shrink-0" />
        )}
        {verdict.correct ? labels.correctBanner : labels.wrongBanner}
      </div>

      {/* 해설 */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm leading-relaxed text-foreground">
        💡 {round.explanation}
      </div>

      {/* 단서 도감 수집 */}
      {focusClue && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className={cn(
            "mt-2 rounded-xl p-3",
            verdict.correct ? "sd-clue-card" : "sd-clue-card-missed",
          )}
        >
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
            <BookMarked className="h-3.5 w-3.5" />
            {verdict.correct ? labels.newClueTitle : labels.missedClueNote}
          </div>
          <div className="flex items-start gap-2">
            <span className={cn("text-2xl", !verdict.correct && "opacity-50 grayscale")}>
              {focusClue.emoji}
            </span>
            <div>
              <div className="text-sm font-black">{focusClue.name}</div>
              <p className="text-xs leading-relaxed text-muted-foreground">{focusClue.desc}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SdContent, SdResult, SdRound, SdVerdict } from "../types";

interface DetailSheetProps {
  content: SdContent;
  round: SdRound;
  /** 열려 있는 결과 (null이면 닫힘) */
  result: SdResult | null;
  verdict: SdVerdict | null;
  onClose: () => void;
  /** find-sponsor에서 협찬 문구로 지목한 문장을 제출 */
  onSubmitLine: (resultId: string, lineIndex: number) => void;
}

/**
 * 상세 미리보기 — 결과를 탭하면 열리는 바닥 시트.
 * 본문 요약과 숨은 단서(작은 협찬 문구, 조건 글씨 등)를 보여 준다.
 * find-sponsor 라운드에서는 문장을 탭해 협찬 문구를 지목할 수 있다.
 */
export default function DetailSheet({
  content,
  round,
  result,
  verdict,
  onClose,
  onSubmitLine,
}: DetailSheetProps) {
  const { labels } = content;
  const answered = verdict !== null;
  const sponsorMode = round.questionType === "find-sponsor" && !answered;

  // 지목해 둔 문장 — 결과가 바뀌면 초기화 (StrictMode에도 안전한 단순 상태)
  const [pendingLine, setPendingLine] = useState<number | null>(null);
  useEffect(() => {
    setPendingLine(null);
  }, [result?.id, round.id]);

  return (
    <AnimatePresence>
      {result && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-30 bg-black/30"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.28 }}
            className="absolute inset-x-0 bottom-0 z-40 max-h-[80%] overflow-y-auto rounded-t-2xl border-t bg-card p-4 shadow-2xl"
          >
            <div className="sd-sheet-handle mb-2.5" />
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="sd-favicon" aria-hidden>
                    {result.favicon}
                  </span>
                  <span className="font-bold text-foreground">{result.site}</span>
                  <span className="min-w-0 truncate">{result.pathish}</span>
                  {result.adChip && (
                    <span className="sd-ad-chip">{labels.adChipLabel}</span>
                  )}
                </div>
                <h3 className="mt-1 text-base font-bold leading-snug">{result.title}</h3>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {result.date}
                  {result.price && (
                    <>
                      {" · "}
                      <span className="sd-price">{result.price}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label={labels.detailClose}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {sponsorMode && (
              <p className="mb-2 flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary">
                <FileSearch className="h-3.5 w-3.5 shrink-0" />
                {labels.sponsorPickHint}
              </p>
            )}

            {/* 본문 문장들 */}
            <div className="space-y-1.5">
              {result.detail.map((line, i) => {
                const isFine = result.sponsorTextIndex === i;
                const isRevealed =
                  answered && result.type === "sponsor" && isFine;
                if (sponsorMode) {
                  return (
                    <button
                      key={i}
                      onClick={() => setPendingLine(i)}
                      className={cn(
                        "sd-line sd-line-tappable text-sm leading-relaxed",
                        isFine && "sd-fineprint",
                        pendingLine === i && "sd-line-selected",
                      )}
                    >
                      {line}
                    </button>
                  );
                }
                return (
                  <p
                    key={i}
                    className={cn(
                      "sd-line text-sm leading-relaxed",
                      isFine && "sd-fineprint",
                      isRevealed && "sd-fineprint-reveal",
                    )}
                  >
                    {line}
                  </p>
                );
              })}
            </div>

            {sponsorMode && pendingLine !== null ? (
              <button
                onClick={() => onSubmitLine(result.id, pendingLine)}
                className="sd-btn-cta mt-4 w-full rounded-xl py-3 text-sm font-bold text-white"
              >
                {labels.sponsorConfirm}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="mt-4 w-full rounded-xl bg-secondary py-2.5 text-sm font-bold text-secondary-foreground"
              >
                {labels.detailClose}
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

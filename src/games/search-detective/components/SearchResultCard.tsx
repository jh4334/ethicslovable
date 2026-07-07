import { motion } from "framer-motion";
import { Megaphone, ShieldCheck, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SdClue, SdContent, SdResult, SdRound, SdVerdict } from "../types";

interface SearchResultCardProps {
  content: SdContent;
  round: SdRound;
  result: SdResult;
  index: number;
  /** find-ads/pick-trusted에서 현재 골라 둔 상태인지 */
  selected: boolean;
  verdict: SdVerdict | null;
  clueById: Map<string, SdClue>;
  onOpen: () => void;
  onToggle: () => void;
}

/** 누리찾기 검색 결과 한 개 — 포털 결과 페이지 카드 */
export default function SearchResultCard({
  content,
  round,
  result: r,
  index,
  selected,
  verdict,
  clueById,
  onOpen,
  onToggle,
}: SearchResultCardProps) {
  const { labels, resultTypeLabels } = content;
  const answered = verdict !== null;

  // 판정 후 카드 상태 — 정답 결과인지, 내가 고른 결과인지
  const isTarget = answered && verdict.correctIds.includes(r.id);
  const isPicked = answered && verdict.pickedIds.includes(r.id);
  const revealClass = !answered
    ? undefined
    : isTarget && isPicked
      ? "sd-reveal-target"
      : isTarget
        ? "sd-reveal-missed"
        : isPicked
          ? "sd-reveal-wrongpick"
          : undefined;
  const markLabel = !answered
    ? null
    : isTarget && isPicked
      ? labels.markPickedRight
      : isTarget
        ? labels.markMissedTarget
        : isPicked
          ? labels.markPickedWrong
          : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.09 }}
      className={cn(
        "sd-result rounded-xl bg-card p-3",
        r.type === "qna" && "sd-result-qna",
        revealClass,
      )}
    >
      {/* 사이트 줄: 파비콘 + 사이트명 + 주소풍 경로 + 광고 칩 */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="sd-favicon" aria-hidden>
          {r.favicon}
        </span>
        <span className="shrink-0 font-bold text-foreground">{r.site}</span>
        <span className="min-w-0 truncate">{r.pathish}</span>
        {r.adChip && <span className="sd-ad-chip">{labels.adChipLabel}</span>}
      </div>

      {/* 파란 제목 링크 — 탭하면 상세 미리보기 */}
      <button
        onClick={onOpen}
        className="sd-title-link mt-1 block w-full text-[15px] font-bold leading-snug"
      >
        {r.type === "qna" && (
          <span className="sd-qna-badge mr-1 align-middle">{labels.qnaBadge}</span>
        )}
        {r.title}
      </button>

      {/* 회색 스니펫 2줄 */}
      <p className="sd-clamp2 mt-0.5 text-xs leading-relaxed text-muted-foreground">
        {r.snippet}
      </p>

      {/* 날짜 · 가격 · 조작 단추 */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[11px] text-muted-foreground">
          {r.date}
          {r.price && (
            <>
              {" · "}
              <span className="sd-price">{r.price}</span>
            </>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <button onClick={onOpen} className="sd-preview-btn">
            <Eye className="h-3 w-3" />
            {labels.previewButton}
          </button>
          {!answered && round.questionType === "find-ads" && (
            <button
              onClick={onToggle}
              className={cn("sd-select-btn", selected && "sd-select-btn-on")}
              aria-pressed={selected}
            >
              <Megaphone className="h-3 w-3" />
              {selected ? labels.selectedAd : labels.selectAd}
            </button>
          )}
          {!answered && round.questionType === "pick-trusted" && (
            <button
              onClick={onToggle}
              className={cn("sd-select-btn", selected && "sd-select-btn-on")}
              aria-pressed={selected}
            >
              <ShieldCheck className="h-3 w-3" />
              {selected ? labels.selectedTrusted : labels.selectTrusted}
            </button>
          )}
        </span>
      </div>

      {/* 판정 후: 유형 배지 + 단서 칩 공개 */}
      {answered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 flex flex-wrap items-center gap-1 border-t border-border/70 pt-2"
        >
          <span className={cn("sd-type-badge", `sd-type-${r.type}`)}>
            {resultTypeLabels[r.type]}
          </span>
          {r.clueIds.map((cid) => {
            const clue = clueById.get(cid);
            if (!clue) return null;
            return (
              <span key={cid} className="sd-clue-chip">
                {clue.emoji} {clue.name}
              </span>
            );
          })}
          {markLabel && (
            <span className="ml-auto text-[11px] font-bold text-muted-foreground">
              {markLabel}
            </span>
          )}
        </motion.div>
      )}
    </motion.article>
  );
}

import { motion } from "framer-motion";
import { ArrowRight, Newspaper } from "lucide-react";
import type { AftermathContent } from "./types";

interface AftermathPanelProps {
  /** 방금 클리어한 미션의 "누리마을의 반응" 콘텐츠 */
  aftermath: AftermathContent;
  /** 마지막 레벨이면 버튼 문구가 "최종 보고서 보기"로 바뀐다 */
  isLastLevel: boolean;
  /** 다음 미션(또는 최종 보고서)으로 진행 */
  onProceed: () => void;
}

/**
 * 미션 클리어 직후 나타나는 "누리마을의 반응" 오버레이.
 * 뉴스 헤드라인 + 시민 댓글로, 방금 내린 알고리즘 결정이
 * 마을 사람들에게 어떤 영향을 줬는지 보여 준다. (정보 제공용 — 점수와 무관)
 */
export default function AftermathPanel({ aftermath, isLastLevel, onProceed }: AftermathPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="누리마을의 반응"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl animate-scale-in md:p-6"
      >
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold tracking-tight text-card-foreground">
          📰 누리마을의 반응
        </h2>

        {/* 뉴스 헤드라인 — 뉴스 티커 카드 */}
        <div className="tt-aftermath-headline mb-4 flex items-start gap-2 p-3">
          <Newspaper size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
          <p className="text-sm font-extrabold leading-relaxed text-card-foreground">{aftermath.headline}</p>
        </div>

        {/* 시민 댓글 (채팅 말풍선) */}
        <div className="mb-5 space-y-3">
          {aftermath.comments.map((comment, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.25, duration: 0.3 }}
            >
              <div className="mb-1 pl-2 text-xs font-bold text-muted-foreground">{comment.author}</div>
              <div className="tt-aftermath-bubble ml-2 rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed text-card-foreground">
                {comment.text}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={onProceed}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mlq-btn-primary w-full"
        >
          {isLastLevel ? "최종 보고서 보기" : "다음 미션으로"} <ArrowRight size={18} aria-hidden />
        </motion.button>
      </div>
    </div>
  );
}

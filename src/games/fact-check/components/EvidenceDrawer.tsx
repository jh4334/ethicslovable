import { AnimatePresence, motion } from "framer-motion";
import { X, FileText } from "lucide-react";
import type { FcContent, FcEvidence } from "../types";

interface EvidenceDrawerProps {
  content: FcContent;
  evidence: FcEvidence[];
  open: boolean;
  onClose: () => void;
}

/** 자료 서랍 — 근거 카드를 모아 보여 주는 슬라이드 패널 */
export default function EvidenceDrawer({ content, evidence, open, onClose }: EvidenceDrawerProps) {
  const { labels } = content;
  return (
    <AnimatePresence>
      {open && (
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
            className="absolute inset-x-0 bottom-0 z-40 max-h-[78%] overflow-y-auto rounded-t-2xl border-t bg-card p-4 shadow-2xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-base font-bold">
                <FileText className="h-4 w-4 text-primary" />
                {labels.drawerTitle}
              </h3>
              <button
                onClick={onClose}
                aria-label={labels.closeDrawer}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">{labels.drawerHint}</p>

            <div className="space-y-2.5">
              {evidence.map((ev) => (
                <div key={ev.key} className="fc-drawer-card rounded-xl p-3">
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="rounded bg-accent/40 px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                      {ev.source}
                    </span>
                    <span className="text-sm font-bold">{ev.title}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">{ev.text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl bg-secondary py-2.5 text-sm font-bold text-secondary-foreground"
            >
              {labels.closeDrawer}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

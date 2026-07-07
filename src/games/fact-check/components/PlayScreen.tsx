import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, CheckCircle2, XCircle, ArrowRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FcContent } from "../types";
import type { FactCheckGame } from "../useFactCheckGame";
import { useTypedReveal } from "../useTypedReveal";
import EvidenceDrawer from "./EvidenceDrawer";

interface PlayScreenProps {
  content: FcContent;
  game: FactCheckGame;
}

/** 반응 문구를 라운드 id 기준으로 안정적으로 하나 고른다 */
function pick(list: string[], seed: string): string {
  if (!list || list.length === 0) return "";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

export default function PlayScreen({ content, game }: PlayScreenProps) {
  const { labels, nuribotReactions } = content;
  const { round, verdict } = game;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const shown = useTypedReveal(round.sentences.length, round.id);
  const answered = verdict !== null;
  // 판정 전에는 타이핑이 끝나야 문장 선택이 가능하게 (모두 표시된 뒤)
  const allShown = shown >= round.sentences.length;

  const evidenceByKey = useMemo(() => {
    const m: Record<string, (typeof round.evidence)[number]> = {};
    round.evidence.forEach((e) => (m[e.key] = e));
    return m;
  }, [round]);

  const falseSentence =
    verdict && verdict.falseIndex >= 0 ? round.sentences[verdict.falseIndex] : null;
  const falseEvidence =
    falseSentence?.evidenceKey ? evidenceByKey[falseSentence.evidenceKey] : null;

  const reaction = useMemo(() => {
    if (!verdict) return "";
    if (verdict.correct) {
      return verdict.falseIndex === -1
        ? pick(nuribotReactions.correctAllTrue, round.id)
        : pick(nuribotReactions.correct, round.id);
    }
    return pick(nuribotReactions.wrong, round.id);
  }, [verdict, nuribotReactions, round.id]);

  const handleSentenceClick = (i: number) => {
    if (answered || !allShown) return;
    game.verify(i);
    setDrawerOpen(false);
  };

  const handleAllTrue = () => {
    if (answered || !allShown) return;
    game.verify(null);
    setDrawerOpen(false);
  };

  return (
    <div className="fc-shell relative mx-auto flex min-h-[calc(100vh-2.75rem)] w-full max-w-md flex-col overflow-hidden border-x">
      {/* 상단 바 */}
      <header className="sticky top-0 z-10 w-full border-b bg-card/95 px-3 py-2 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">
            {labels.roundLabel} {game.roundIndex + 1}
            <span className="text-muted-foreground"> / {game.totalRounds}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                round.isRealWorld
                  ? "bg-primary/15 text-primary"
                  : "bg-accent/40 text-accent-foreground",
              )}
            >
              {round.isRealWorld ? labels.realWorldBadge : labels.villageBadge}
            </span>
            <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
              {game.score}점
            </span>
          </div>
        </div>
        <div className="mt-1.5 flex gap-1">
          {Array.from({ length: game.totalRounds }, (_, i) => (
            <div
              key={i}
              className={cn(
                "fc-progress-dot h-1.5 flex-1 rounded-full",
                i < game.roundIndex
                  ? "bg-success"
                  : i === game.roundIndex
                    ? "bg-primary"
                    : "bg-muted",
              )}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-3 pb-32">
        {/* 마을 사람의 질문 (오른쪽) */}
        <div className="mb-4 flex items-start justify-end gap-2">
          <div className="max-w-[80%]">
            <div className="mb-0.5 text-right text-[11px] font-medium text-muted-foreground">
              {round.asker}
            </div>
            <div className="fc-bubble-asker rounded-2xl px-3 py-2 text-sm leading-relaxed text-foreground">
              {round.question}
            </div>
          </div>
          <div className="fc-asker-avatar flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
            {round.asker.slice(0, 1)}
          </div>
        </div>

        {/* 누리봇의 답 (왼쪽) — 문장별 검증 대상 */}
        <div className="flex items-start gap-2">
          <div className="fc-bot-avatar flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base">
            🤖
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 text-[11px] font-medium text-muted-foreground">누리봇</div>
            <div className="fc-bubble-bot rounded-2xl p-2.5">
              {!answered && allShown && (
                <p className="mb-2 text-[11px] text-muted-foreground">{labels.pickHint}</p>
              )}
              <div className="space-y-1.5">
                {round.sentences.map((s, i) => {
                  const isShown = i < shown;
                  if (!isShown) return null;
                  const isFalseReveal = answered && i === verdict!.falseIndex;
                  const isWrongPick =
                    answered &&
                    verdict!.pickedIndex === i &&
                    i !== verdict!.falseIndex;
                  const isTrueReveal =
                    answered && i !== verdict!.falseIndex && !isWrongPick;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      disabled={answered || !allShown}
                      onClick={() => handleSentenceClick(i)}
                      className={cn(
                        "fc-sentence block w-full rounded-lg border px-2.5 py-2 text-left text-sm leading-relaxed",
                        !answered && "fc-sentence-clickable border-border",
                        isFalseReveal && "fc-sentence-false",
                        isTrueReveal && "fc-sentence-true",
                        isWrongPick && "fc-sentence-wrongpick",
                        answered && "cursor-default",
                      )}
                    >
                      <span className="mr-1 inline-flex align-middle">
                        {isFalseReveal && (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        {isTrueReveal && (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        )}
                      </span>
                      {s.text}
                    </motion.button>
                  );
                })}
                {!allShown && (
                  <div className="fc-typing-dots flex items-center px-1 py-1">
                    <span />
                    <span />
                    <span />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 판정 결과 + 해설 */}
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div
              className={cn(
                "mb-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold",
                verdict!.correct
                  ? "bg-success/15 text-success"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {verdict!.correct ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {verdict!.correct
                ? verdict!.falseIndex === -1
                  ? "정확해요! 이 답은 모두 사실이었어요."
                  : "정확해요! 거짓 문장을 찾았어요."
                : "아쉬워요. 함께 다시 확인해 봐요."}
            </div>

            {/* 누리봇 반응 */}
            <div className="mb-2 flex items-start gap-2">
              <div className="fc-bot-avatar flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm">
                🤖
              </div>
              <div className="fc-bubble-bot rounded-2xl px-3 py-2 text-sm leading-relaxed">
                {reaction}
              </div>
            </div>

            {/* 근거 카드 인용 (거짓 문장이 있을 때) */}
            {falseEvidence && (
              <div className="fc-drawer-card mb-2 rounded-xl p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                  <Quote className="h-3.5 w-3.5" />
                  {labels.evidenceQuote} · {falseEvidence.source}
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {falseEvidence.text}
                </p>
              </div>
            )}

            {/* 해설 */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm leading-relaxed text-foreground">
              💡 {round.explanation}
            </div>
          </motion.div>
        )}
      </main>

      {/* 하단 고정 조작 영역 */}
      <div className="sticky bottom-0 z-10 border-t bg-card/95 p-3 backdrop-blur">
        {!answered ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/15"
            >
              <FolderOpen className="h-4 w-4" />
              {labels.openDrawer} ({round.evidence.length})
            </button>
            <button
              onClick={handleAllTrue}
              disabled={!allShown}
              className="w-full rounded-xl bg-success py-2.5 text-sm font-bold text-success-foreground shadow transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
            >
              {labels.allTrueButton}
            </button>
          </div>
        ) : (
          <button
            onClick={game.next}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-base font-bold text-primary-foreground shadow transition hover:brightness-105 active:scale-[0.99]"
          >
            {game.isLastRound ? labels.resultButton : labels.nextButton}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <EvidenceDrawer
        content={content}
        evidence={round.evidence}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

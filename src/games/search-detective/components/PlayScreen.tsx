import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SdClue, SdContent } from "../types";
import type { SearchDetectiveGame } from "../useSearchDetectiveGame";
import { useTypingQuery } from "../useTypingQuery";
import SearchResultCard from "./SearchResultCard";
import DetailSheet from "./DetailSheet";
import VerdictPanel from "./VerdictPanel";

interface PlayScreenProps {
  content: SdContent;
  game: SearchDetectiveGame;
}

/** 누리찾기 결과 페이지 — 미션 진행 화면 */
export default function PlayScreen({ content, game }: PlayScreenProps) {
  const { labels } = content;
  const { round, verdict, selectedIds } = game;
  const answered = verdict !== null;

  // 검색창 타이핑 애니메이션 — 라운드가 바뀌면 처음부터 다시
  const { typed, done } = useTypingQuery(round.query, round.id);

  // 상세 미리보기로 열어 둔 결과
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    setOpenId(null);
  }, [round.id]);
  const openResult = round.results.find((r) => r.id === openId) ?? null;

  const clueById = useMemo(() => {
    const m = new Map<string, SdClue>();
    content.clues.forEach((c) => m.set(c.id, c));
    return m;
  }, [content.clues]);

  const typeHint =
    round.questionType === "find-ads"
      ? labels.typeHintFindAds
      : round.questionType === "pick-trusted"
        ? labels.typeHintPickTrusted
        : labels.typeHintFindSponsor;

  const canSubmit =
    round.questionType === "pick-trusted"
      ? selectedIds.length === 1
      : selectedIds.length > 0;

  const handleSubmitLine = (resultId: string, lineIndex: number) => {
    game.submitSponsorLine(resultId, lineIndex);
    setOpenId(null);
  };

  return (
    <div className="sd-shell relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col overflow-hidden border-x">
      {/* 상단 진행 바 */}
      <header className="sticky top-0 z-10 w-full border-b bg-card/95 px-3 py-2 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">
            {labels.roundLabel} {game.roundIndex + 1}
            <span className="text-muted-foreground"> / {game.totalRounds}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
              🔖 단서 {game.collectedClueIds.length}/{content.clues.length}
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
                "sd-progress-dot h-1.5 flex-1 rounded-full",
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
        {/* 의뢰인 말풍선 */}
        <div className="mb-3 flex items-start gap-2">
          <div className="sd-client-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg">
            {round.clientEmoji}
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 text-[11px] font-medium text-muted-foreground">
              {labels.clientLabel} · {round.client}
            </div>
            <div className="sd-bubble-client rounded-2xl px-3 py-2 text-sm leading-relaxed text-foreground">
              {round.request}
            </div>
          </div>
        </div>

        {/* 누리찾기 포털 헤더 — 로고 + 검색창(타이핑) */}
        <div className="sd-portal rounded-2xl p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-lg" aria-hidden>
              🧭
            </span>
            <span className="sd-gradient-text text-lg font-black tracking-tight">누리찾기</span>
          </div>
          <div className="sd-searchbox">
            <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">
              {typed}
              {!done && <span className="sd-caret" aria-hidden />}
            </span>
            <span className="sd-search-btn" aria-hidden>
              <Search className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {!done && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {labels.searchingLabel}
          </p>
        )}

        {done && (
          <>
            {/* 탐정 질문 배너 */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-xl border border-primary/25 bg-primary/5 p-3"
            >
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-primary">
                <HelpCircle className="h-3.5 w-3.5" />
                {labels.questionTitle}
              </div>
              <p className="text-sm font-bold leading-relaxed">{round.question}</p>
              {!answered && (
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {typeHint}
                </p>
              )}
            </motion.div>

            {/* 검색 결과 5개 */}
            <div className="mt-3 space-y-2.5">
              {round.results.map((r, i) => (
                <SearchResultCard
                  key={r.id}
                  content={content}
                  round={round}
                  result={r}
                  index={i}
                  selected={selectedIds.includes(r.id)}
                  verdict={verdict}
                  clueById={clueById}
                  onOpen={() => setOpenId(r.id)}
                  onToggle={() => game.toggleSelect(r.id)}
                />
              ))}
            </div>

            {/* 판정 + 해설 + 단서 수집 */}
            {answered && (
              <VerdictPanel
                content={content}
                round={round}
                verdict={verdict}
                clueById={clueById}
              />
            )}
          </>
        )}
      </main>

      {/* 하단 고정 조작 영역 */}
      <div className="sticky bottom-0 z-10 border-t bg-card/95 p-3 backdrop-blur">
        {!answered ? (
          round.questionType === "find-sponsor" ? (
            <p className="py-1.5 text-center text-xs font-bold leading-relaxed text-muted-foreground">
              {labels.sponsorBottomHint}
            </p>
          ) : (
            <button
              onClick={game.submitSelection}
              disabled={!done || !canSubmit}
              className="sd-btn-cta flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-base font-bold text-white"
            >
              {round.questionType === "find-ads"
                ? labels.submitFindAds
                : labels.submitPickTrusted}
              {selectedIds.length > 0 && (
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs">
                  {selectedIds.length}
                </span>
              )}
            </button>
          )
        ) : (
          <button
            onClick={game.next}
            className="sd-btn-cta flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-base font-bold text-white"
          >
            {game.isLastRound ? labels.resultButton : labels.nextButton}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 상세 미리보기 시트 */}
      <DetailSheet
        content={content}
        round={round}
        result={openResult}
        verdict={verdict}
        onClose={() => setOpenId(null)}
        onSubmitLine={handleSubmitLine}
      />
    </div>
  );
}

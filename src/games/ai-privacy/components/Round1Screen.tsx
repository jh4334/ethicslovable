import { useEffect, useMemo, useRef } from "react";
import { ArrowRight, Check, Menu, Plus, ShieldAlert, Smile, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApContent, ApDangerType, ApRound } from "../types";
import type { AiPrivacyGame } from "../useAiPrivacyGame";

interface Round1ScreenProps {
  content: ApContent;
  game: AiPrivacyGame;
}

/** 메시지 본문 — reveal 단계에서만 개인정보 부분을 빨갛게 강조 */
function MessageText({ text, highlight, mark }: { text: string; highlight?: string; mark: boolean }) {
  if (!mark || !highlight || !text.includes(highlight)) {
    return <span>{text}</span>;
  }
  const parts = text.split(highlight);
  return (
    <span>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <mark className="ap-mark">{highlight}</mark>}
        </span>
      ))}
    </span>
  );
}

/** 친구의 '작성 중' 초안 말풍선 (오른쪽 · 점선) */
function DraftBubble({ round, mark }: { round: ApRound; mark: boolean }) {
  return (
    <div className="ap-msg flex items-end justify-end gap-1.5">
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[10px] font-bold text-muted-foreground">작성 중</span>
      </div>
      <div className="min-w-0 max-w-[80%]">
        {round.photo && (
          <div className="ap-photo mb-1">
            <div className="ap-photo-frame" aria-hidden>
              {round.photo}
            </div>
          </div>
        )}
        <div className="ap-draft px-3 py-2 text-sm font-medium leading-relaxed text-foreground">
          <MessageText text={round.message} highlight={round.highlight} mark={mark} />
        </div>
      </div>
    </div>
  );
}

export default function Round1Screen({ content, game }: Round1ScreenProps) {
  const { labels, round1, intro } = content;
  const round = round1[game.r1Index];
  const isLast = game.r1Index >= round1.length - 1;
  const revealed = game.r1Stage === "reveal";
  const verdict = game.r1Verdicts[game.r1Index];

  const dangerMap = useMemo(() => {
    const map: Record<string, ApDangerType> = {};
    content.dangerTypes.forEach((d) => (map[d.id] = d));
    return map;
  }, [content.dangerTypes]);

  const correct = verdict === "send" ? round.safe : !round.safe;
  const danger = round.dangerTypeId ? dangerMap[round.dangerTypeId] : undefined;

  // 새 말풍선·해설이 나올 때마다 맨 아래로 스크롤
  const feedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [game.r1Index, game.r1Stage]);

  return (
    <div className="ap-shell flex h-[calc(100vh-3rem)] flex-col items-center px-2 pb-2 pt-3 sm:px-4">
      {/* 진행 상태 스트립 */}
      <div className="mb-2 flex w-full max-w-md items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-extrabold text-muted-foreground">
            {labels.part1Label} · {labels.roundLabel} {game.r1Index + 1}/{round1.length}
          </span>
          <div className="flex items-center gap-1">
            {round1.map((_, i) => {
              const v = game.r1Verdicts[i];
              const ok = v == null ? null : v === "send" ? round1[i].safe : !round1[i].safe;
              return (
                <span
                  key={i}
                  className={cn(
                    "ap-dot h-2 w-2 rounded-full",
                    ok === true && "bg-success",
                    ok === false && "bg-destructive",
                    ok == null && i === game.r1Index && "ap-dot-current bg-primary/60",
                    ok == null && i !== game.r1Index && "bg-foreground/15",
                  )}
                />
              );
            })}
          </div>
        </div>
        <span className="ap-score-chip inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold">
          📒 {labels.dexLabel} {game.collectedTypeIds.length}/{content.dangerTypes.length}
        </span>
      </div>

      {/* 폰 프레임 — 누리봇 대화 */}
      <div className="ap-phone flex w-full max-w-md flex-1 flex-col overflow-hidden">
        {/* 상단 누리봇 헤더 */}
        <header className="ap-bot-header flex items-center gap-2 px-3 py-2.5">
          <span className="ap-bot-avatar" aria-hidden>
            🤖
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold leading-tight">{intro.botName}</p>
            <p className="text-[10px] font-medium text-success">● {labels.botStatus}</p>
          </div>
          <Menu className="h-[18px] w-[18px] shrink-0 text-muted-foreground" aria-hidden />
        </header>

        {/* 대화 영역 */}
        <div ref={feedRef} className="ap-feed flex-1 overflow-y-auto px-3 pb-4 pt-4">
          {/* 친구 소개 라인 */}
          <div className="mb-3 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-1 text-[11px] font-bold text-muted-foreground">
              <span aria-hidden>{round.senderEmoji ?? "🙂"}</span>
              {round.sender} 님이 누리봇에게 보내려고 해요
            </span>
          </div>

          <DraftBubble round={round} mark={revealed} />

          {/* 판정 해설 카드 */}
          {revealed && (
            <div
              className={cn(
                "ap-verdict mt-4 rounded-2xl p-3.5 text-left",
                correct ? "ap-verdict-ok" : "ap-verdict-bad",
              )}
            >
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-extrabold">
                <span className="text-base" aria-hidden>
                  {correct ? "✅" : "❗"}
                </span>
                {correct ? labels.correctTitle : labels.wrongTitle}
                <span className="ml-auto text-xs font-bold text-muted-foreground">
                  {round.safe ? labels.safeVerdict : labels.dangerVerdict}
                </span>
              </p>
              <p className="text-[13px] leading-relaxed text-foreground/85">{round.explain}</p>

              {/* 위험 유형 · 도감 수집 */}
              {danger && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                    <span aria-hidden>{danger.emoji}</span>
                    개인정보: {danger.name}
                  </span>
                  {correct && (
                    <span className="ap-collect-badge inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black">
                      📒 {danger.name} {labels.collected}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 판단 패널 (보내기 OK / 멈춰) */}
        {!revealed && (
          <div className="ap-judge-panel p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold leading-relaxed text-muted-foreground">
              <ShieldAlert className="h-4 w-4 shrink-0 text-primary" />
              {labels.draftHint}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => game.judge("send")}
                className="ap-judge-btn ap-judge-send flex items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-extrabold"
              >
                <Check className="h-4 w-4" />
                {labels.sendOk}
              </button>
              <button
                onClick={() => game.judge("stop")}
                className="ap-judge-btn ap-judge-stop flex items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-extrabold"
              >
                <X className="h-4 w-4" />
                {labels.stop}
              </button>
            </div>
          </div>
        )}

        {/* 해설 후 — 다음 버튼 */}
        {revealed && (
          <div className="ap-judge-panel p-3">
            <button
              onClick={game.nextRound}
              className="ap-btn-cta flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-extrabold"
            >
              {isLast ? labels.toPart2 : labels.nextRound}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 하단 입력바 (장식) */}
        <div className="ap-inputbar flex items-center gap-2 px-2.5 py-2">
          <Plus className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="ap-input-fake flex min-w-0 flex-1 items-center justify-between gap-2 rounded-full px-3 py-1.5">
            <span className="truncate text-xs">{labels.inputPlaceholder}</span>
            <Smile className="h-4 w-4 shrink-0" aria-hidden />
          </div>
          <span className="ap-send-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
}

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DfContent, DfEyeItem, DfSide } from "../types";
import type { DeepfakeGame } from "../useDeepfakeGame";
import { DfScene } from "../svgs";

interface EyeTestScreenProps {
  content: DfContent;
  game: DeepfakeGame;
}

/** 한쪽 콘텐츠 카드 — 글 또는 '사진'(그림) */
function EyeCard({
  side,
  item,
  isImage,
  revealed,
  isAi,
  picked,
  aiBadge,
  humanBadge,
  onPick,
}: {
  side: DfSide;
  item: DfEyeItem;
  isImage: boolean;
  revealed: boolean;
  isAi: boolean;
  picked: boolean;
  aiBadge: string;
  humanBadge: string;
  onPick: () => void;
}) {
  return (
    <button
      onClick={onPick}
      disabled={revealed}
      className={cn(
        "df-eye-card flex h-full flex-col gap-2 rounded-2xl p-3",
        !revealed && "df-eye-card-clickable",
        revealed && (isAi ? "df-eye-card-ai" : "df-eye-card-human"),
        revealed && picked && "df-eye-card-picked",
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-black text-secondary-foreground">
          {side}
        </span>
        {revealed && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              isAi ? "df-badge-ai" : "df-badge-human",
            )}
          >
            {isAi ? aiBadge : humanBadge}
          </span>
        )}
      </div>

      {isImage ? (
        <DfScene svgId={item.svgId} title={item.label} className="df-photo" />
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="text-xs font-extrabold leading-snug">{item.label}</div>
        {!isImage && item.content && (
          <p className="mt-1 text-[11.5px] leading-relaxed text-foreground/85">{item.content}</p>
        )}
      </div>

      <div className="text-[10px] text-muted-foreground">{item.byline}</div>
    </button>
  );
}

/** 1부 · 눈 시험 — 진짜 vs AI, 5라운드 (단서 없음이 핵심) */
export default function EyeTestScreen({ content, game }: EyeTestScreenProps) {
  const { eyeTest, labels } = content;
  const { eyeRound: round, eyeVerdict } = game;
  const revealed = eyeVerdict !== null;
  const reduce = useReducedMotion();

  return (
    <div className="df-shell min-h-[calc(100vh-3rem)] px-4 py-5">
      <div className="mx-auto w-full max-w-xl">
        {/* 진행 헤더 */}
        <header className="mb-3">
          <div className="flex items-center justify-between">
            <span className="mlq-chip bg-warning/15 text-warning-foreground">
              <Eye className="h-3.5 w-3.5" />
              {labels.part1}
            </span>
            <span className="text-sm font-bold">
              {labels.roundLabel} {game.eyeIndex + 1}
              <span className="text-muted-foreground"> / {game.totalEyeRounds}</span>
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: game.totalEyeRounds }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "df-progress-dot h-1.5 flex-1 rounded-full",
                  i < game.eyeIndex
                    ? "bg-success"
                    : i === game.eyeIndex
                      ? "bg-warning"
                      : "bg-muted",
                )}
              />
            ))}
          </div>
        </header>

        {/* 라운드 소개 + 질문 */}
        <motion.div
          key={round.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mlq-card mb-3 p-3.5">
            <p className="text-sm leading-relaxed text-foreground/90">{round.topic}</p>
            <p className="df-gradient-text mt-1.5 text-base font-black">{eyeTest.prompt}</p>
            {!revealed && (
              <p className="mt-1 text-[11px] text-muted-foreground">{eyeTest.hint}</p>
            )}
          </div>

          {/* 두 콘텐츠 나란히 */}
          <div className="relative grid grid-cols-2 items-stretch gap-2.5">
            <EyeCard
              side="A"
              item={round.itemA}
              isImage={round.type === "image"}
              revealed={revealed}
              isAi={round.aiIs === "A"}
              picked={eyeVerdict?.pick === "A"}
              aiBadge={labels.aiBadge}
              humanBadge={labels.humanBadge}
              onPick={() => game.pickEye("A")}
            />
            <EyeCard
              side="B"
              item={round.itemB}
              isImage={round.type === "image"}
              revealed={revealed}
              isAi={round.aiIs === "B"}
              picked={eyeVerdict?.pick === "B"}
              aiBadge={labels.aiBadge}
              humanBadge={labels.humanBadge}
              onPick={() => game.pickEye("B")}
            />
            <span className="df-vs-badge pointer-events-none absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-black">
              VS
            </span>
          </div>

          {/* 정답 공개 — 이유는 설명하지 않는다 */}
          {revealed && eyeVerdict && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <div className="df-reveal-card rounded-2xl p-3.5">
                <div
                  className={cn(
                    "mb-1 text-sm font-black",
                    eyeVerdict.correct ? "text-success" : "text-destructive",
                  )}
                >
                  {eyeVerdict.correct ? `⭕ ${labels.correctPick}` : `❌ ${labels.wrongPick}`}
                </div>
                <p className="text-sm leading-relaxed">{round.revealNote}</p>
              </div>
              <button
                onClick={game.nextEye}
                className="df-btn-cta mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-base font-bold"
              >
                {game.isLastEyeRound ? labels.toMidButton : labels.nextButton}
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

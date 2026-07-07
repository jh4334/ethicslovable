/**
 * 수사 화면 — 사건 하나를 판별 → 단서 찾기 → 해설 순서로 진행한다.
 */
import { CheckCircle2, XCircle, FileImage, FileText, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DfContent, DfRound } from "../types";
import type { DeepfakeGame } from "../useDeepfakeGame";
import ClueNotebook from "./ClueNotebook";
import EvidencePhoto from "./EvidencePhoto";

interface PlayScreenProps {
  content: DfContent;
  game: DeepfakeGame;
}

/** 판별 결과에 맞는 안내 문구를 고른다 */
function judgeMessage(content: DfContent, round: DfRound, correct: boolean): string {
  const { ui } = content;
  if (round.isFake) return correct ? ui.judgeCorrectFake : ui.judgeWrongFake;
  return correct ? ui.judgeCorrectReal : ui.judgeWrongReal;
}

export default function PlayScreen({ content, game }: PlayScreenProps) {
  const { ui, rules } = content;
  const round = game.round;
  if (!round) return null;

  const isLast = game.roundIndex + 1 >= game.totalRounds;
  const inExplain = game.step === "explain";

  return (
    <div className="mx-auto w-full max-w-md space-y-2.5 p-3 pb-6">
      {/* 상단: 사건 번호 · 점수 */}
      <div className="flex items-center justify-between">
        <span className="mlq-chip df-chip-amber text-[11px]">
          {ui.roundLabel} {game.roundIndex + 1}/{game.totalRounds}
        </span>
        <span className="mlq-chip bg-card text-[11px] shadow-soft">
          {ui.scoreLabel} {game.score}점
        </span>
      </div>

      {/* 단서 수첩 */}
      <ClueNotebook
        clues={content.clues}
        collectedIds={game.collectedClueIds}
        newIds={inExplain ? game.newClueIds : []}
        title={ui.notebookTitle}
        lockedName={content.result.lockedName}
      />

      {/* 증거 카드 */}
      <div className="mlq-card relative animate-fade-in overflow-hidden" key={round.id}>
        <div className="df-case-header flex items-center gap-1.5 px-3 py-2">
          {round.type === "image" ? (
            <FileImage className="h-3.5 w-3.5 shrink-0 text-warning" />
          ) : (
            <FileText className="h-3.5 w-3.5 shrink-0 text-warning" />
          )}
          <span className="df-tag-chip rounded px-1.5 py-0.5 text-[10px] font-bold">
            {round.type === "image" ? ui.imageTag : ui.textTag}
          </span>
          <span className="df-typed truncate text-[11px] font-semibold">
            {round.type === "image" ? round.caption : round.title}
          </span>
        </div>

        <div className="p-3 pt-4">
          {round.type === "image" ? (
            <div className={cn("df-polaroid", game.roundIndex % 2 === 1 && "df-tilt-r")}>
              <EvidencePhoto
                svgId={round.svgId}
                anomalies={round.anomalies}
                mode={
                  game.step === "hunt"
                    ? "hunt"
                    : inExplain && round.isFake
                      ? "reveal"
                      : "view"
                }
                foundAnomalyId={game.foundAnomalyId}
                onPick={game.pickImageSpot}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              {round.sentences.map((sentence, i) => {
                const isSuspicious = inExplain && round.isFake && i === round.suspiciousIndex;
                const isPickedWrong =
                  inExplain && game.pickedSentence === i && i !== round.suspiciousIndex;
                if (game.step === "hunt") {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => game.pickSentence(i)}
                      className="df-sentence block w-full rounded-lg border bg-secondary/40 px-2.5 py-2 text-left text-xs leading-relaxed transition-colors"
                    >
                      {sentence}
                    </button>
                  );
                }
                return (
                  <p
                    key={i}
                    className={cn(
                      "rounded-lg px-2.5 py-2 text-xs leading-relaxed",
                      isSuspicious && "df-anomaly-ring border-2 border-dashed border-destructive bg-destructive/10 font-medium",
                      isPickedWrong && "border border-border bg-muted text-muted-foreground line-through",
                    )}
                  >
                    {sentence}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* 판별 도장 */}
        {inExplain && (
          <span
            className={cn(
              "df-stamp absolute right-3 top-10 rounded-lg border-4 px-2.5 py-1 text-sm font-black",
              round.isFake
                ? "border-destructive text-destructive"
                : "border-success text-success",
            )}
          >
            {round.isFake ? "AI 가짜" : "진짜"}
          </span>
        )}
      </div>

      {/* 하단 패널 — 단계별 */}
      {game.step === "judge" && (
        <div className="mlq-card animate-fade-in p-3">
          <p className="mb-2.5 text-center text-xs font-extrabold">{ui.judgePrompt}</p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => game.judge(false)}
              className="df-stamp-btn df-stamp-real py-3.5 text-sm"
            >
              ⭕ {ui.realButton}
            </button>
            <button
              type="button"
              onClick={() => game.judge(true)}
              className="df-stamp-btn df-stamp-fake py-3.5 text-sm"
            >
              🤖 {ui.fakeButton}
            </button>
          </div>
        </div>
      )}

      {game.step === "hunt" && (
        <div className="df-hunt-banner animate-fade-in rounded-2xl p-3">
          <p className="mb-1 flex items-center gap-2 text-xs font-extrabold text-warning-foreground">
            <span className="df-hunt-icon">
              <Search className="h-4 w-4" />
            </span>
            {ui.huntTitle}
            <span className="ml-auto rounded-full bg-warning/30 px-2 py-0.5 text-[10px] font-bold">
              +{rules.cluePoints}점
            </span>
          </p>
          <p className="text-[11px] leading-relaxed text-warning-foreground/80">
            {round.type === "image" ? ui.huntPromptImage : ui.huntPromptText}
          </p>
        </div>
      )}

      {inExplain && game.judgeResult && (
        <div className="mlq-card animate-fade-in space-y-2 p-3">
          {/* 판별 결과 */}
          <p
            className={cn(
              "flex items-center gap-1.5 text-xs font-bold",
              game.judgeResult.correct ? "text-success" : "text-destructive",
            )}
          >
            {game.judgeResult.correct ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            {judgeMessage(content, round, game.judgeResult.correct)}
            {game.judgeResult.correct && (
              <span className="ml-auto shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                +{rules.judgePoints}점
              </span>
            )}
          </p>

          {/* 단서 찾기 결과 */}
          {game.huntResult === "found" && (
            <p className="flex items-center gap-1.5 text-xs font-bold text-warning-foreground">
              <Search className="h-4 w-4 shrink-0 text-warning" />
              {ui.huntFound}
              <span className="ml-auto shrink-0 rounded-full bg-warning/25 px-2 py-0.5 text-[10px] font-bold">
                +{rules.cluePoints}점
              </span>
            </p>
          )}
          {game.huntResult === "missed" && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Search className="h-4 w-4 shrink-0" />
              {ui.huntMissed}
            </p>
          )}

          {/* 새로 기록한 단서 */}
          {game.newClueIds.length > 0 && (
            <div className="rounded-lg bg-accent/30 px-2.5 py-1.5">
              <p className="text-[10px] font-semibold text-accent-foreground">
                📔 {ui.clueCollected}
              </p>
              <p className="text-[11px] font-bold text-accent-foreground">
                {content.clues
                  .filter((c) => game.newClueIds.includes(c.id))
                  .map((c) => c.name)
                  .join(" · ")}
              </p>
            </div>
          )}

          {/* 해설 */}
          <div className="rounded-lg bg-secondary/60 p-2.5">
            <p className="mb-1 text-[10px] font-bold text-muted-foreground">
              🔎 {ui.explainTitle}
            </p>
            <p className="text-xs leading-relaxed">{round.explain}</p>
          </div>

          <button
            type="button"
            onClick={game.next}
            className="mlq-btn-primary df-btn-cta flex w-full gap-1 py-2.5 text-sm"
          >
            {isLast ? ui.finishButton : ui.nextButton}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

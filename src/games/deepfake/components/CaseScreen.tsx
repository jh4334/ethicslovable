import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowRight, Check, FolderSearch, Siren } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DfContent, DfTool } from "../types";
import type { DeepfakeGame } from "../useDeepfakeGame";

interface CaseScreenProps {
  content: DfContent;
  game: DeepfakeGame;
}

/** 2부 · 검증 수사 — 충격 게시물을 도구 4개로 조사하고 결론을 내린다 */
export default function CaseScreen({ content, game }: CaseScreenProps) {
  const { labels, tools, caseRules } = content;
  const { currentCase, usedTools, caseVerdict } = game;
  const concluded = caseVerdict !== null;
  const reduce = useReducedMotion();

  const toolById = new Map<string, DfTool>(tools.map((t) => [t.id, t]));
  const answerLabel = (a: "real" | "fake") =>
    a === "real" ? labels.conclusionReal : labels.conclusionFake;

  return (
    <div className="df-shell min-h-[calc(100vh-3rem)] px-4 py-5">
      <div className="mx-auto w-full max-w-md">
        {/* 진행 헤더 */}
        <header className="mb-3">
          <div className="flex items-center justify-between">
            <span className="mlq-chip bg-warning/15 text-warning-foreground">
              <FolderSearch className="h-3.5 w-3.5" />
              {labels.part2}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold">
                {labels.caseLabel} {game.caseIndex + 1}
                <span className="text-muted-foreground"> / {game.totalCases}</span>
              </span>
              <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
                {game.caseScore}
                {labels.scoreSuffix}
              </span>
            </div>
          </div>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: game.totalCases }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "df-progress-dot h-1.5 flex-1 rounded-full",
                  i < game.caseIndex
                    ? "bg-success"
                    : i === game.caseIndex
                      ? "bg-warning"
                      : "bg-muted",
                )}
              />
            ))}
          </div>
        </header>

        <motion.div
          key={currentCase.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 충격 게시물 */}
          <div className="df-case-card rounded-2xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="df-viral-chip mlq-chip">
                <Siren className="h-3.5 w-3.5" />
                지금 퍼지는 중
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="mlq-emoji-tile flex h-12 w-12 shrink-0 text-2xl" style={{ ["--tile-hue" as string]: 0 }}>
                {currentCase.emoji}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-black leading-snug">{currentCase.headline}</h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/85">
                  {currentCase.contentDesc}
                </p>
              </div>
            </div>
          </div>

          {/* 검증 도구함 */}
          <div className="mt-3">
            <div className="mb-1.5 flex items-baseline justify-between">
              <h3 className="text-sm font-extrabold">🧰 {labels.toolboxTitle}</h3>
              {!concluded && (
                <span className="text-[11px] text-muted-foreground">{labels.toolHint}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool) => {
                const used = usedTools.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    onClick={() => game.investigate(tool.id)}
                    disabled={used || concluded}
                    className={cn(
                      "df-tool-btn flex items-start gap-2 rounded-xl p-2.5",
                      used && "df-tool-btn-used",
                    )}
                  >
                    <span className="text-xl leading-none">{tool.emoji}</span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 text-[13px] font-extrabold">
                        {tool.name}
                        {used && <Check className="h-3.5 w-3.5 text-success" />}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] leading-snug text-muted-foreground">
                        {tool.desc}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 조사 결과 카드 (사용한 순서대로) */}
          {usedTools.length > 0 && (
            <div className="mt-3">
              <h3 className="mb-1.5 text-sm font-extrabold">📋 {labels.evidenceTitle}</h3>
              <div className="space-y-2">
                {usedTools.map((toolId) => {
                  const tool = toolById.get(toolId);
                  return (
                    <motion.div
                      key={toolId}
                      initial={reduce ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className="df-evidence-card rounded-xl p-3"
                    >
                      <div className="mb-1 text-[11px] font-black text-warning-foreground/80">
                        {tool?.emoji} {tool?.name}
                      </div>
                      <p className="text-[13px] leading-relaxed">
                        {currentCase.toolResults[toolId]}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 도구 0개 경고 */}
          {game.showNoToolWarning && !concluded && (
            <div className="df-warning-banner mt-3 flex items-start gap-2 rounded-xl p-3 text-sm font-bold leading-relaxed">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {labels.noToolWarning}
            </div>
          )}

          {/* 결론 선택 */}
          {!concluded ? (
            <div className="mt-4">
              <p className="mb-2 text-center text-sm font-extrabold">{labels.concludePrompt}</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => game.conclude("real")}
                  className="df-conclusion-btn df-conclusion-real rounded-xl py-3 text-sm font-black"
                >
                  ⭕ {labels.conclusionReal}
                </button>
                <button
                  onClick={() => game.conclude("fake")}
                  className="df-conclusion-btn df-conclusion-fake rounded-xl py-3 text-sm font-black"
                >
                  ❌ {labels.conclusionFake}
                </button>
                <button
                  onClick={() => game.conclude("unsure")}
                  className="df-conclusion-btn df-conclusion-unsure rounded-xl py-3 text-sm font-black"
                >
                  ❓ {labels.conclusionUnsure}
                </button>
              </div>
            </div>
          ) : (
            /* 판정 + 해설 */
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div
                className={cn(
                  "rounded-2xl p-3.5",
                  caseVerdict.correct ? "df-verdict-correct" : "df-verdict-wrong",
                )}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "text-sm font-black",
                      caseVerdict.correct ? "text-success" : "text-destructive",
                    )}
                  >
                    {caseVerdict.correct ? labels.verdictCorrect : labels.verdictWrong}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    정답: {answerLabel(currentCase.answer)}
                  </span>
                  {caseVerdict.points > 0 && (
                    <span className="ml-auto rounded-full bg-white/70 px-2 py-0.5 text-xs font-black">
                      +{caseVerdict.points}
                      {labels.scoreSuffix}
                    </span>
                  )}
                </div>
                {caseVerdict.conclusion === "unsure" && (
                  <p className="mt-1.5 text-[13px] font-bold leading-relaxed">
                    {labels.unsureFeedback}
                  </p>
                )}
                <p className="mt-1.5 text-[13px] leading-relaxed">{currentCase.explanation}</p>
                {caseVerdict.gotBonus && (
                  <div className="df-bonus-chip mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold">
                    🏆 +{caseRules.processBonus}
                    {labels.scoreSuffix} · {labels.bonusNote}
                  </div>
                )}
              </div>

              {/* 사기 예방 등 특별 경고 */}
              {currentCase.dangerNote && (
                <div className="df-danger-card mt-2.5 rounded-2xl p-3.5">
                  <div className="mb-1 flex items-center gap-1.5 text-sm font-black text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    {labels.dangerTitle}
                  </div>
                  <p className="text-[13px] leading-relaxed">{currentCase.dangerNote}</p>
                </div>
              )}

              <button
                onClick={game.nextCase}
                className="df-btn-cta mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-base font-bold"
              >
                {game.isLastCase ? labels.resultButton : labels.nextCaseButton}
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Check, Home, RotateCcw, X } from "lucide-react";
import { markCompleted } from "@/lib/progress";
import type { AgContent } from "../types";
import type { AiGrowGame } from "../useAiGrowGame";

interface FinaleScreenProps {
  content: AgContent;
  game: AiGrowGame;
}

/**
 * 결과 · 나의 성장 기록 — 누리봇의 되물음 장치 + 성장 등급 + 3가지 약속 + 16차시 수료.
 * markCompleted 는 ref 가드로 딱 한 번만 호출한다 (StrictMode 안전).
 */
export default function FinaleScreen({ content, game }: FinaleScreenProps) {
  const { finale, grades, promises, missions } = content;

  const grade = useMemo(() => {
    const sorted = [...grades].sort((a, b) => b.min - a.min);
    return (
      sorted.find((g) => game.growthScore >= g.min) ?? sorted[sorted.length - 1]
    );
  }, [grades, game.growthScore]);

  const completedRef = useRef(false);
  useEffect(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    markCompleted(
      "ai-grow",
      `성장 등급 ${grade.title} · 지식으로 오류 ${game.errorsCaught}개 잡음`,
    );
  }, [grade.title, game.errorsCaught]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  return (
    <div className="ag-shell flex min-h-[calc(100vh-3rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg animate-fade-in">
        {/* 누리봇의 되물음 장치 */}
        <div className="mlq-card mb-6 p-5 text-left">
          <p className="mb-1 flex items-center gap-1.5 text-sm font-black">
            <span className="ag-bot h-6 w-6 text-sm" aria-hidden>
              🤖
            </span>
            {finale.recallTitle}
          </p>
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            {finale.recallIntro}
          </p>
          <div className="flex flex-col gap-2.5">
            {missions.map((m, i) => {
              const canAnswer = game.allProgress[i]?.acquired.includes(
                m.recall.requiresKnowledgeId,
              );
              return (
                <div
                  key={m.id}
                  className={[
                    "rounded-xl p-3",
                    canAnswer ? "ag-recall-can" : "ag-recall-cannot",
                  ].join(" ")}
                >
                  <p className="mb-1 text-xs font-bold text-muted-foreground">
                    {m.emoji} 누리봇: “{m.recall.botQuestion}”
                  </p>
                  <p className="flex items-start gap-1.5 text-sm font-bold leading-relaxed">
                    <span className="mt-0.5 shrink-0">
                      {canAnswer ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <X className="h-4 w-4 text-orange-500" />
                      )}
                    </span>
                    <span>
                      나: “{canAnswer ? m.recall.canAnswer : m.recall.cannotAnswer}”
                      <span className="ml-1.5 text-[11px] font-black text-muted-foreground">
                        {canAnswer
                          ? finale.recallCanTag
                          : finale.recallCannotTag}
                      </span>
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold leading-relaxed text-amber-900">
            🌟 {finale.recallInsight}
          </p>
        </div>

        {/* 성장 등급 */}
        <div className="text-center">
          <div className="ag-emblem mx-auto mb-4">
            <span aria-hidden>{grade.emoji}</span>
          </div>
          <p className="mb-1 text-xs font-extrabold tracking-wide text-primary">
            {finale.resultTitle}
          </p>
          <h2 className="ag-gradient-text mb-3 text-3xl font-black sm:text-4xl">
            {grade.title}
          </h2>

          <div className="mx-auto mb-4 flex max-w-xs items-center justify-center gap-2 text-xs font-extrabold">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
              🌱 {finale.skillSummary} {game.totalSkill} / {game.maxSkill}
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-800">
              🔍 {finale.errorSummary} {game.errorsCaught} / {game.totalMissions}
            </span>
          </div>

          <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {grade.desc}
          </p>

          {/* 학습지 연계 안내 */}
          <p className="mx-auto mb-6 max-w-md text-[11px] leading-relaxed text-muted-foreground">
            📄 {finale.worksheetNote}
          </p>

          {/* 다짐 카드 */}
          <div className="ag-promise-card mx-auto mb-3 max-w-md p-6 text-left">
            <h3 className="ag-gradient-text mb-4 text-center text-xl font-black">
              📜 {finale.promiseTitle}
            </h3>
            <ol className="mb-4 flex flex-col gap-2.5">
              {promises.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="ag-promise-num flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black">
                    {i + 1}
                  </span>
                  <span className="text-sm font-bold leading-relaxed">{p}</span>
                </li>
              ))}
            </ol>
            <p className="text-right text-[11px] font-bold text-muted-foreground">
              {today} · 🌱 나 · {finale.cardName}
            </p>
          </div>

          <p className="mx-auto mb-6 max-w-md rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs leading-relaxed text-foreground/80">
            ✏️ {finale.promiseGuide}
          </p>

          {/* 16차시 전체 여정 마무리 */}
          <div className="mlq-card mx-auto mb-7 max-w-md p-5 text-sm leading-relaxed">
            <p className="mb-1.5 text-base font-black">
              🎓 {finale.graduationTitle}
            </p>
            <p className="text-muted-foreground">{finale.graduationMessage}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={game.restart}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-extrabold text-foreground transition hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" />
              {finale.retryButton}
            </button>
            <Link
              to="/"
              className="ag-btn-cta inline-flex items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-extrabold"
            >
              <Home className="h-4 w-4" />
              {finale.homeButton}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

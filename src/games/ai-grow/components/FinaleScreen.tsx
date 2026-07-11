import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Home, RotateCcw } from "lucide-react";
import { markCompleted } from "@/lib/progress";
import type { AgContent } from "../types";
import type { AiGrowGame } from "../useAiGrowGame";

interface FinaleScreenProps {
  content: AgContent;
  game: AiGrowGame;
}

/**
 * 결과 · 나의 AI 사용 다짐 — 성장 등급 + 3가지 약속 카드 + 16차시 전체 여정 수료.
 * markCompleted 는 ref 가드로 딱 한 번만 호출한다 (StrictMode 안전).
 */
export default function FinaleScreen({ content, game }: FinaleScreenProps) {
  const { finale, grades, promises, seedLabel } = content;
  const total = content.situations.length;

  const grade = useMemo(() => {
    const sorted = [...grades].sort((a, b) => b.min - a.min);
    return sorted.find((g) => game.seeds >= g.min) ?? sorted[sorted.length - 1];
  }, [grades, game.seeds]);

  const completedRef = useRef(false);
  useEffect(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    markCompleted(
      "ai-grow",
      `성장 등급 ${grade.title} · 나를 키우는 선택 ${game.seeds}개`,
    );
  }, [grade.title, game.seeds]);

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
      <div className="w-full max-w-lg animate-fade-in text-center">
        {/* 등급 엠블럼 */}
        <div className="ag-emblem mx-auto mb-4">
          <span aria-hidden>{grade.emoji}</span>
        </div>
        <p className="mb-1 text-xs font-extrabold tracking-wide text-primary">
          {finale.resultTitle}
        </p>
        <h2 className="ag-gradient-text mb-2 text-3xl font-black sm:text-4xl">
          {grade.title}
        </h2>
        <p className="mb-4 text-sm font-extrabold text-muted-foreground">
          {finale.seedSummary}: 🌱 {game.seeds} / {total}
        </p>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          {grade.desc}
        </p>

        {/* AI 사용 다짐 카드 — 3가지 약속 */}
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
            {today} · 🌱 나
          </p>
        </div>

        <p className="mx-auto mb-6 max-w-md rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs leading-relaxed text-foreground/80">
          ✏️ {finale.promiseGuide}
        </p>

        {/* 16차시 전체 여정 마무리 */}
        <div className="mlq-card mx-auto mb-7 max-w-md p-5 text-sm leading-relaxed">
          <p className="mb-1.5 text-base font-black">🎓 {finale.graduationTitle}</p>
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
  );
}

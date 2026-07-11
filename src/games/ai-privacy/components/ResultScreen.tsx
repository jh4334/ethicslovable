import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Check, Home, RotateCcw, X } from "lucide-react";
import { markCompleted } from "@/lib/progress";
import type { ApContent } from "../types";
import type { AiPrivacyGame } from "../useAiPrivacyGame";

interface ResultScreenProps {
  content: ApContent;
  game: AiPrivacyGame;
}

/**
 * 결과 화면 — 안전 점수·요원 등급·정리 카드·안전 수칙.
 * markCompleted 는 ref 가드로 딱 한 번만 호출한다 (StrictMode 안전).
 */
export default function ResultScreen({ content, game }: ResultScreenProps) {
  const { grades, dangerTypes, compare, safetyRules } = content;

  const grade = useMemo(() => {
    const sorted = [...grades].sort((a, b) => b.min - a.min);
    return sorted.find((g) => game.totalCorrect >= g.min) ?? sorted[sorted.length - 1];
  }, [grades, game.totalCorrect]);

  const scorePct = Math.round((game.totalCorrect / game.totalQuestions) * 100);

  const completedRef = useRef(false);
  useEffect(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    markCompleted(
      "ai-privacy",
      `안전 요원 등급 ${grade.title} · 위험 정보 ${game.collectedTypeIds.length}종 배움`,
    );
  }, [grade.title, game.collectedTypeIds.length]);

  const collected = useMemo(
    () => new Set(game.collectedTypeIds),
    [game.collectedTypeIds],
  );

  return (
    <div className="ap-shell min-h-[calc(100vh-3rem)] px-4 py-10">
      <div className="mx-auto w-full max-w-lg animate-fade-in text-center">
        {/* 등급 엠블럼 */}
        <div className="ap-emblem mx-auto mb-4">
          <span aria-hidden>{grade.emoji}</span>
        </div>
        <h2 className="ap-gradient-text mb-1 text-3xl font-black sm:text-4xl">
          {grade.title}
        </h2>
        <p className="mb-4 text-sm font-extrabold text-muted-foreground">
          안전 점수 {game.totalCorrect}/{game.totalQuestions}
          <span className="ml-1 text-primary">({scorePct}점)</span>
        </p>

        {/* 안전 점수 미터 */}
        <div className="ap-meter mx-auto mb-4 max-w-md" role="img" aria-label={`안전 점수 ${scorePct}점`}>
          <span style={{ width: `${scorePct}%` }} />
        </div>

        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          {grade.desc}
        </p>

        {/* 위험 정보 도감 */}
        <div className="mlq-card mb-4 p-5 text-left">
          <p className="mb-3 text-center text-sm font-black">
            📒 내가 모은 위험 정보 도감{" "}
            <span className="text-primary">
              {game.collectedTypeIds.length}/{dangerTypes.length}
            </span>
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {dangerTypes.map((d) => {
              const got = collected.has(d.id);
              return (
                <div
                  key={d.id}
                  className="ap-dex-tile flex flex-col items-center gap-0.5 p-2.5 text-center"
                  data-got={got}
                  title={d.desc}
                >
                  <span className="text-2xl" aria-hidden>
                    {got ? d.emoji : "❔"}
                  </span>
                  <span className="text-[11px] font-bold">{d.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 말해도 돼요 vs 안 돼요 */}
        <div className="mb-4 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
          <div className="ap-compare-ok p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-black text-success">
              <Check className="h-4 w-4" />
              {compare.okTitle}
            </p>
            <ul className="flex flex-col gap-1.5">
              {compare.okItems.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[12.5px] font-semibold leading-snug">
                  <span className="mt-0.5 text-success" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="ap-compare-no p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-black text-destructive">
              <X className="h-4 w-4" />
              {compare.noTitle}
            </p>
            <ul className="flex flex-col gap-1.5">
              {compare.noItems.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[12.5px] font-semibold leading-snug">
                  <span className="mt-0.5 text-destructive" aria-hidden>
                    ✕
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 안전 수칙 카드 */}
        <div className="ap-rule-card mx-auto mb-3 max-w-md p-6 text-left">
          <h3 className="ap-gradient-text mb-4 text-center text-xl font-black">
            🛡️ 누리봇 안전 수칙 4가지
          </h3>
          <ol className="flex flex-col gap-2.5">
            {safetyRules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="ap-rule-num flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black">
                  {i + 1}
                </span>
                <span className="text-sm font-bold leading-relaxed">{rule}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="mx-auto mb-7 max-w-md rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground/80">
          ✏️ 이 안전 수칙 4가지를 학습지에 옮겨 적고, 우리 반 누리봇 사용 약속으로 삼아 봐요.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={game.restart}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-extrabold text-foreground transition hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
            다시 하기
          </button>
          <Link
            to="/"
            className="ap-btn-cta inline-flex items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-extrabold"
          >
            <Home className="h-4 w-4" />
            퀘스트 지도로
          </Link>
        </div>
      </div>
    </div>
  );
}

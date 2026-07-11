import { Sprout, Sparkles } from "lucide-react";
import type { AgContent } from "../types";

interface StartScreenProps {
  content: AgContent;
  onStart: () => void;
}

/** 시작 화면 — 마지막 퀘스트 안내 + 성장 여정 시작 */
export default function StartScreen({ content, onStart }: StartScreenProps) {
  const { intro, situations } = content;

  return (
    <div className="ag-shell flex min-h-[calc(100vh-3rem)] items-center justify-center px-4 py-10">
      <div className="mlq-card w-full max-w-lg animate-fade-in p-7 text-center sm:p-9">
        <div className="mlq-emoji-tile ag-hero-tile mx-auto mb-5 h-20 w-20 text-4xl">
          🌱
        </div>

        <span className="mlq-chip ag-chip-final mb-3">🏁 {intro.badge}</span>
        <h1 className="ag-gradient-text mb-3 text-3xl font-black sm:text-4xl">
          {intro.title}
        </h1>

        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {intro.story}
        </p>

        {/* 오늘 만날 학습 상황 미리보기 */}
        <div className="mb-5 rounded-2xl border border-border bg-secondary/40 p-4">
          <p className="mb-2 text-xs font-extrabold text-secondary-foreground">
            누리봇과 함께 겪을 {situations.length}가지 학습 상황
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-2xl">
            {situations.map((s) => (
              <span
                key={s.id}
                className="ag-preview-tile inline-flex h-10 w-10 items-center justify-center rounded-xl"
                aria-hidden
              >
                {s.emoji}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-3 rounded-xl border border-primary/25 bg-primary/5 p-3.5 text-left text-sm leading-relaxed">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-extrabold text-primary">
            <Sprout className="h-4 w-4" /> 나의 임무
          </p>
          {intro.mission}
        </div>

        <div className="mb-6 rounded-xl border border-border bg-muted/60 p-3.5 text-left text-sm leading-relaxed text-muted-foreground">
          💡 {intro.tip}
        </div>

        <button
          onClick={onStart}
          className="ag-btn-cta inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-extrabold sm:w-auto"
        >
          <Sparkles className="h-5 w-5" />
          {intro.startLabel}
        </button>
      </div>
    </div>
  );
}

import { Sparkles, Sprout } from "lucide-react";
import type { AgContent } from "../types";

interface StartScreenProps {
  content: AgContent;
  onStart: () => void;
}

/** 시작 화면 — 마지막 퀘스트 안내 + 성장 미션 시작 */
export default function StartScreen({ content, onStart }: StartScreenProps) {
  const { intro, missions, labels } = content;

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

        {/* 오늘 해결할 미션 미리보기 */}
        <div className="mb-5 rounded-2xl border border-border bg-secondary/40 p-4">
          <p className="mb-3 text-xs font-extrabold text-secondary-foreground">
            누리봇과 함께 해결할 {missions.length}가지 미션
          </p>
          <div className="flex flex-col gap-2">
            {missions.map((m) => (
              <div
                key={m.id}
                className="ag-preview-tile flex items-center gap-3 rounded-xl px-3 py-2 text-left"
              >
                <span className="text-2xl" aria-hidden>
                  {m.emoji}
                </span>
                <span>
                  <span className="ag-chip-field mr-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-black">
                    {m.field}
                  </span>
                  <span className="text-sm font-bold">{m.title}</span>
                </span>
              </div>
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

        <p className="mt-4 text-[11px] text-muted-foreground">{labels.stepHint}</p>
      </div>
    </div>
  );
}

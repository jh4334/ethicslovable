import { ShieldCheck, Send } from "lucide-react";
import type { ApContent } from "../types";

interface StartScreenProps {
  content: ApContent;
  onStart: () => void;
}

/** 시작 화면 — 누리봇 소개 + 안전 요원 임무 안내 */
export default function StartScreen({ content, onStart }: StartScreenProps) {
  const { intro, dangerTypes } = content;

  return (
    <div className="ap-shell flex min-h-[calc(100vh-3rem)] items-center justify-center px-4 py-10">
      <div className="mlq-card w-full max-w-lg animate-fade-in p-7 text-center sm:p-9">
        <div className="mlq-emoji-tile ap-hero-tile mx-auto mb-5 h-20 w-20 text-4xl">
          🔒
        </div>

        <span className="mlq-chip ap-chip-blue mb-3">🛡️ {intro.badge}</span>
        <h1 className="ap-gradient-text mb-3 text-3xl font-black sm:text-4xl">
          {intro.title}
        </h1>

        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {intro.story}
        </p>

        {/* 위험 정보 미리보기 — 도감 종류 */}
        <div className="mb-5 rounded-2xl border border-border bg-secondary/50 p-4">
          <p className="mb-2 text-xs font-extrabold text-secondary-foreground">
            누리봇에게 조심해야 할 개인정보
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {dangerTypes.map((d) => (
              <span
                key={d.id}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-xs font-bold"
              >
                <span aria-hidden>{d.emoji}</span>
                {d.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-left text-sm leading-relaxed">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-extrabold text-primary">
            <ShieldCheck className="h-4 w-4" /> 안전 요원 임무
          </p>
          {intro.mission}
        </div>

        <div className="mb-6 rounded-xl border border-border bg-muted/60 p-3.5 text-left text-sm leading-relaxed text-muted-foreground">
          💡 {intro.tip}
        </div>

        <button
          onClick={onStart}
          className="ap-btn-cta inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-extrabold sm:w-auto"
        >
          <Send className="h-5 w-5" />
          {intro.startLabel}
        </button>
      </div>
    </div>
  );
}

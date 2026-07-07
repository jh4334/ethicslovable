import type { DbContent } from "../types";
import BabyBot from "./BabyBot";

interface IntroScreenProps {
  content: DbContent;
  onStart: () => void;
}

/** 인트로 — AI 연구소 배경 설명과 임무 안내 */
export default function IntroScreen({ content, onStart }: IntroScreenProps) {
  const { meta, babyBot } = content;
  return (
    <div className="mx-auto flex min-h-[calc(100vh-2.75rem)] w-full max-w-md flex-col items-center justify-center px-4 py-8">
      <div className="w-full animate-fade-in rounded-2xl border bg-card p-6 text-center shadow-sm">
        <div className="mb-2 text-xs font-bold text-primary">{meta.labName}</div>
        <div className="mb-3 text-5xl" aria-hidden>
          🍚🤖
        </div>
        <h1 className="text-xl font-black">{meta.gameTitle}</h1>
        <p className="mt-1 text-xs font-medium text-muted-foreground">{meta.tagline}</p>

        <div className="mt-5 space-y-3 text-left text-sm leading-relaxed text-foreground/90">
          {meta.introParagraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-5 flex justify-center">
          <BabyBot line={babyBot.hungryLine} mood="eating" />
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-6 w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
        >
          {meta.startButton}
        </button>
      </div>
    </div>
  );
}

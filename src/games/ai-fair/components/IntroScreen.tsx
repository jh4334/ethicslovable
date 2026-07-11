import type { CSSProperties } from "react";
import type { AfContent } from "../types";

interface IntroScreenProps {
  content: AfContent;
  onStart: () => void;
}

/** 인트로 — 포용 설계자 임무 안내 */
export default function IntroScreen({ content, onStart }: IntroScreenProps) {
  const { meta } = content;
  return (
    <div className="mx-auto flex min-h-[calc(100vh-2.75rem)] w-full max-w-md flex-col items-center justify-center px-4 py-8">
      <div className="mlq-card w-full animate-fade-in p-6 text-center">
        <div className="af-grad-text mb-3 text-xs font-extrabold tracking-wide">
          {meta.role}
        </div>
        <div
          className="mlq-emoji-tile animate-float mb-4 h-24 w-24 text-5xl"
          style={{ "--tile-hue": 95 } as CSSProperties}
          aria-hidden
        >
          ⚖️🤖
        </div>
        <h1 className="text-2xl font-black">{meta.gameTitle}</h1>
        <p className="mt-1 text-xs font-medium text-muted-foreground">{meta.tagline}</p>

        <div className="mt-5 space-y-3 text-left text-sm leading-relaxed text-foreground/90">
          {meta.introParagraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <button type="button" onClick={onStart} className="af-btn mt-6 w-full px-6 py-3 text-sm">
          {meta.startButton}
        </button>
      </div>
    </div>
  );
}

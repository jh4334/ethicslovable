/**
 * 시작 화면 — 수사대 소개와 놀이 방법.
 */
import type { CSSProperties } from "react";
import { BadgeCheck } from "lucide-react";
import type { DfContent } from "../types";
import type { DeepfakeGame } from "../useDeepfakeGame";

interface StartScreenProps {
  content: DfContent;
  game: DeepfakeGame;
}

export default function StartScreen({ content, game }: StartScreenProps) {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center p-4">
      <div className="mlq-card w-full max-w-sm animate-scale-in p-5 text-center shadow-lift">
        <div
          className="mlq-emoji-tile mx-auto mb-3 h-20 w-20 text-5xl shadow-soft"
          style={{ "--tile-hue": 33 } as CSSProperties}
        >
          🕵️
        </div>
        <h1 className="df-gradient-text mb-0.5 text-2xl font-black">{content.meta.gameTitle}</h1>
        <p className="df-ink mb-2 text-xs font-bold">{content.meta.tagline}</p>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          {content.meta.intro}
        </p>

        <div className="mb-4 space-y-1.5 rounded-xl bg-accent/20 p-3 text-left">
          {content.meta.howTo.map((line, i) => (
            <p key={i} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
              <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <span>{line}</span>
            </p>
          ))}
        </div>

        <button
          type="button"
          onClick={game.start}
          className="mlq-btn-primary df-btn-cta w-full text-sm"
        >
          {content.meta.startButton}
        </button>
      </div>
    </div>
  );
}

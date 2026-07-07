/**
 * 시작 화면 — 수사대 소개와 놀이 방법.
 */
import { Search, BadgeCheck } from "lucide-react";
import type { DfContent } from "../types";
import type { DeepfakeGame } from "../useDeepfakeGame";

interface StartScreenProps {
  content: DfContent;
  game: DeepfakeGame;
}

export default function StartScreen({ content, game }: StartScreenProps) {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center p-4">
      <div className="w-full max-w-sm animate-scale-in rounded-2xl border bg-card p-5 text-center shadow-lg">
        <div className="df-badge mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl shadow-md">
          <Search className="h-7 w-7 text-white" />
        </div>
        <h1 className="mb-0.5 text-lg font-bold">{content.meta.gameTitle}</h1>
        <p className="mb-2 text-xs font-medium text-primary">{content.meta.tagline}</p>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          {content.meta.intro}
        </p>

        <div className="mb-4 space-y-1.5 rounded-xl bg-secondary/60 p-3 text-left">
          {content.meta.howTo.map((line, i) => (
            <p key={i} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
              <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{line}</span>
            </p>
          ))}
        </div>

        <button
          type="button"
          onClick={game.start}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95"
        >
          {content.meta.startButton}
        </button>
      </div>
    </div>
  );
}

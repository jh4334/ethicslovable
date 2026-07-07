import { ScrollText } from "lucide-react";
import type { CgContent } from "../types";
import type { ChatGuardGame } from "../useChatGuardGame";

interface PromiseScreenProps {
  content: CgContent;
  game: ChatGuardGame;
}

/**
 * 마무리 활동 1 — 우리 반 단톡방 약속 고르기.
 * 후보 6개는 모두 좋은 항목이라 정답이 없다.
 * '나에게 필요한 약속'을 3개 고르는 자기 결정 활동.
 */
export default function PromiseScreen({ content, game }: PromiseScreenProps) {
  const { finale, promiseCandidates } = content;
  const selected = game.selectedPromises;
  const full = selected.length >= 3;

  return (
    <div className="cg-shell flex min-h-[calc(100vh-3rem)] items-center justify-center px-4 py-8">
      <div className="mlq-card w-full max-w-lg animate-fade-in p-6 sm:p-8">
        <div className="mb-5 text-center">
          <div className="mlq-emoji-tile cg-hero-tile mx-auto mb-4 h-16 w-16 text-3xl">📜</div>
          <span className="mlq-chip cg-chip-final mb-2">🛡️ 지킴이 배지 {game.badges}/{content.episodes.length}</span>
          <h2 className="cg-gradient-text mb-2 text-2xl font-black sm:text-3xl">
            {finale.promiseTitle}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{finale.promiseGuide}</p>
        </div>

        <div className="mb-5 flex flex-col gap-2">
          {promiseCandidates.map((text, i) => {
            const isSelected = selected.includes(i);
            const disabled = !isSelected && full;
            return (
              <button
                key={i}
                data-selected={isSelected}
                disabled={disabled}
                onClick={() => game.togglePromise(i)}
                className="cg-promise-item flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-left text-sm font-semibold leading-relaxed"
              >
                <span className="cg-check mt-0.5">✓</span>
                {text}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-extrabold text-muted-foreground">
            <span className="text-success">{selected.length}</span> / 3개 골랐어요
          </span>
          <button
            onClick={game.confirmPromises}
            disabled={!full}
            className="cg-btn-cta inline-flex items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-extrabold"
          >
            <ScrollText className="h-4 w-4" />
            {finale.promiseButton}
          </button>
        </div>
      </div>
    </div>
  );
}

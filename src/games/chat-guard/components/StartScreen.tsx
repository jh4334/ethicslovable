import { MessageCircleHeart, ShieldCheck } from "lucide-react";
import type { CgContent } from "../types";

interface StartScreenProps {
  content: CgContent;
  onStart: () => void;
}

/** 시작 화면 — 마지막 퀘스트 안내 + 단톡방 입장 */
export default function StartScreen({ content, onStart }: StartScreenProps) {
  const { intro, members, roomTitle } = content;

  return (
    <div className="cg-shell flex min-h-[calc(100vh-3rem)] items-center justify-center px-4 py-10">
      <div className="mlq-card w-full max-w-lg animate-fade-in p-7 text-center sm:p-9">
        <div className="mlq-emoji-tile cg-hero-tile mx-auto mb-5 h-20 w-20 text-4xl">
          💬
        </div>

        <span className="mlq-chip cg-chip-final mb-3">🏁 {intro.badge}</span>
        <h1 className="cg-gradient-text mb-3 text-3xl font-black sm:text-4xl">
          {intro.title}
        </h1>

        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {intro.story}
        </p>

        {/* 단톡방 미리보기 — 멤버 아바타 */}
        <div className="mb-5 rounded-2xl border border-border bg-secondary/50 p-4">
          <p className="mb-2 text-xs font-extrabold text-secondary-foreground">
            {roomTitle}{" "}
            <span className="font-bold text-muted-foreground">
              {content.memberCount}
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {members.map((m) => (
              <span
                key={m.name}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-xs font-bold"
              >
                <span aria-hidden>{m.emoji}</span>
                {m.name}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-1 text-xs font-black text-success">
              ⭐ 나
            </span>
          </div>
        </div>

        <div className="mb-3 rounded-xl border border-success/25 bg-success/5 p-3.5 text-left text-sm leading-relaxed">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-extrabold text-success">
            <ShieldCheck className="h-4 w-4" /> 지킴이 임무
          </p>
          {intro.mission}
        </div>

        <div className="mb-6 rounded-xl border border-border bg-muted/60 p-3.5 text-left text-sm leading-relaxed text-muted-foreground">
          💡 {intro.tip}
        </div>

        <button
          onClick={onStart}
          className="cg-btn-cta inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-extrabold sm:w-auto"
        >
          <MessageCircleHeart className="h-5 w-5" />
          {intro.startLabel}
        </button>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Home, RotateCcw } from "lucide-react";
import { markCompleted } from "@/lib/progress";
import NextQuest from "@/components/NextQuest";
import type { CgContent } from "../types";
import type { ChatGuardGame } from "../useChatGuardGame";

interface FinaleScreenProps {
  content: CgContent;
  game: ChatGuardGame;
}

/**
 * 마무리 활동 2 — 약속 카드 + 12차시 전체 여정 수료.
 * markCompleted 는 ref 가드로 딱 한 번만 호출한다 (StrictMode 안전).
 */
export default function FinaleScreen({ content, game }: FinaleScreenProps) {
  const { finale, grades, promiseCandidates, roomTitle } = content;
  const total = content.episodes.length;

  const grade = useMemo(() => {
    const sorted = [...grades].sort((a, b) => b.min - a.min);
    return sorted.find((g) => game.badges >= g.min) ?? sorted[sorted.length - 1];
  }, [grades, game.badges]);

  const completedRef = useRef(false);
  useEffect(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    markCompleted(
      "chat-guard",
      `지킴이 배지 ${game.badges}/${total} · 단톡방 약속 완성`,
    );
  }, [game.badges, total]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  return (
    <div className="cg-shell flex min-h-[calc(100vh-3rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg animate-fade-in text-center">
        {/* 수료 엠블럼 + 등급 */}
        <div className="cg-emblem mx-auto mb-4">
          <span aria-hidden>🛡️</span>
        </div>
        <h2 className="cg-gradient-text mb-2 text-3xl font-black sm:text-4xl">
          {finale.graduationTitle}
        </h2>
        <p className="mb-5 text-sm font-extrabold">
          <span className="mr-1" aria-hidden>
            {grade.emoji}
          </span>
          {grade.title}
          <span className="ml-2 font-bold text-muted-foreground">
            지킴이 배지 {game.badges}/{total}
          </span>
        </p>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          {grade.desc}
        </p>

        {/* 우리 반 단톡방 약속 카드 */}
        <div className="cg-promise-card mx-auto mb-3 max-w-md p-6 text-left">
          <p className="mb-1 text-center text-[11px] font-extrabold tracking-wide text-success">
            누리톡 · {roomTitle}
          </p>
          <h3 className="cg-gradient-text mb-4 text-center text-xl font-black">
            📜 {finale.cardTitle}
          </h3>
          <ol className="mb-4 flex flex-col gap-2.5">
            {game.selectedPromises.map((pi, order) => (
              <li key={pi} className="flex items-start gap-2.5">
                <span className="cg-promise-num flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black">
                  {order + 1}
                </span>
                <span className="text-sm font-bold leading-relaxed">
                  {promiseCandidates[pi]}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-right text-[11px] font-bold text-muted-foreground">
            {today} · 누리마을 지킴이 ⭐ 나
          </p>
        </div>

        <p className="mx-auto mb-6 max-w-md rounded-xl border border-success/25 bg-success/5 p-3 text-xs leading-relaxed text-foreground/80">
          ✏️ {finale.cardGuide}
        </p>

        {/* 12차시 전체 여정 마무리 */}
        <div className="mlq-card mx-auto mb-7 max-w-md p-5 text-sm leading-relaxed">
          <p className="mb-1.5 text-base font-black">🎓 열두 번째 퀘스트 완료!</p>
          <p className="text-muted-foreground">{finale.graduationMessage}</p>
        </div>

        <div className="mx-auto mb-3 max-w-md">
          <NextQuest gameId="chat-guard" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={game.restart}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-extrabold text-foreground transition hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
            {finale.retryButton}
          </button>
          <Link
            to="/"
            className="cg-btn-cta inline-flex items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-extrabold"
          >
            <Home className="h-4 w-4" />
            {finale.homeButton}
          </Link>
        </div>
      </div>
    </div>
  );
}

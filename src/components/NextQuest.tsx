import { Link } from "react-router-dom";
import { ArrowRight, Map } from "lucide-react";
import type { GameId } from "@/lib/progress";
import { GAMES } from "@/portal/games";
import { cn } from "@/lib/utils";

interface NextQuestProps {
  /** 지금 막 끝낸 게임 */
  gameId: GameId;
  className?: string;
}

/**
 * 결과 화면 공용 버튼 — 차시 순서상 '다음 퀘스트'로 바로 이어 준다.
 * 마지막 차시(16)에서는 '퀘스트 지도로'를 보여 준다. 완료 후 다음 행동이
 * 화면 안에서 자연스럽게 이어지도록, 모든 게임 결과 화면이 함께 쓴다.
 */
export default function NextQuest({ gameId, className }: NextQuestProps) {
  const idx = GAMES.findIndex((g) => g.id === gameId);
  const next = idx >= 0 ? GAMES[idx + 1] : undefined;

  if (!next) {
    return (
      <Link
        to="/"
        className={cn(
          "mlq-btn-primary inline-flex w-full items-center justify-center gap-2 px-6 py-3 text-sm font-black",
          className,
        )}
      >
        <Map className="h-4 w-4" />
        퀘스트 지도로 돌아가기
      </Link>
    );
  }

  return (
    <Link
      to={next.path}
      className={cn(
        "mlq-btn-primary inline-flex w-full items-center justify-center gap-2 px-6 py-3 text-sm font-black",
        className,
      )}
    >
      <span aria-hidden>{next.emoji}</span>
      다음 퀘스트 — {next.lesson}차시 {next.title}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

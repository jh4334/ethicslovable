import { ThumbsUp, MessageSquareText, Star } from "lucide-react";
import type { RoundQuestion } from "../types";

/**
 * 가상 SNS "누리피드"의 게시물 카드.
 * 특정 실제 SNS를 흉내 내지 않도록 자체 디자인:
 * 카테고리 배지가 달린 헤더, 이모지 타일, 알약 모양 반응 버튼 줄.
 */
export default function FeedPostCard({ question }: { question: RoundQuestion }) {
  const { history, account, categoryLabel, likes } = question;

  return (
    <div className="mlq-card mx-3 p-3">
      {/* 헤더: 계정 + 카테고리 배지 */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="si-avatar flex h-8 w-8 items-center justify-center rounded-xl text-base">
            {history.icon}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold leading-tight">{account}</div>
            <div className="text-[10px] text-muted-foreground">
              방금 좋아요를 받은 글이에요
            </div>
          </div>
        </div>
        <span className="mlq-chip bg-secondary text-secondary-foreground">
          {categoryLabel}
        </span>
      </div>

      {/* 게시물 그림 자리(이모지 타일) */}
      <div className="si-photo relative mx-auto flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border">
        <span className="select-none text-6xl">{history.icon}</span>
        <span className="absolute right-2 top-2 rounded-md bg-foreground/70 px-1.5 py-0.5 text-[10px] font-bold text-background">
          {history.mediaType}
        </span>
        <span className="si-accent-text absolute bottom-2 left-2 animate-pop rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold shadow">
          💖 친구가 방금 좋아요를 눌렀어요!
        </span>
      </div>

      {/* 제목 + 태그 */}
      <div className="mt-2 text-left">
        <div className="text-sm font-bold">{history.title}</div>
        <div className="mt-0.5 text-xs font-medium text-primary">{history.tags}</div>
      </div>

      {/* 반응 버튼 줄 — 알약 모양 배지 (장식용) */}
      <div className="mt-2 flex items-center gap-1.5">
        <span className="mlq-chip bg-primary/10 text-primary">
          <ThumbsUp className="h-3.5 w-3.5" />
          좋아요 {likes.toLocaleString("ko-KR")}
        </span>
        <span className="mlq-chip bg-secondary text-secondary-foreground">
          <MessageSquareText className="h-3.5 w-3.5" />
          댓글
        </span>
        <span className="mlq-chip bg-secondary text-secondary-foreground">
          <Star className="h-3.5 w-3.5" />
          모아 두기
        </span>
      </div>
    </div>
  );
}

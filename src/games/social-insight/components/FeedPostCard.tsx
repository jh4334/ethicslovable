import { BadgeCheck, Bookmark, Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import type { RoundQuestion } from "../types";
import { fakeComments, fakeHoursAgo, fakeLikes, isVerified } from "../sns";

/**
 * 가상 SNS "누리피드"의 게시물 카드 — 아이들이 익숙한 일반적인 SNS 게시물 구조.
 * 헤더(링 아바타·계정명·인증 배지·팔로우····) → 미디어 → 액션 줄(하트/댓글/공유/북마크)
 * → 좋아요 수 → 캡션(파란 해시태그) → 댓글 더 보기 → 시간.
 * 특정 서비스의 로고·상표는 쓰지 않고 lucide 아이콘과 누리피드 브랜드색만 사용한다.
 * 좋아요·댓글·시간 숫자는 게시물 문자열 해시로 만든 표시용 값이다.
 */
export default function FeedPostCard({ question }: { question: RoundQuestion }) {
  const { history, account, categoryLabel } = question;
  const seed = `${account}:${history.title}`;
  const likeCount = fakeLikes(seed);
  const commentCount = fakeComments(seed);
  const hoursAgo = fakeHoursAgo(seed);

  return (
    <article className="border-b bg-card">
      {/* 헤더: 그라데이션 링 아바타 + 계정명(+인증 배지) + 팔로우 + ··· */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="si-story-ring si-ring-sm shrink-0">
          <span className="si-story-avatar h-8 w-8 text-base">{history.icon}</span>
        </span>
        <div className="min-w-0 flex-1 text-left leading-tight">
          <div className="flex items-center gap-1">
            <span className="truncate text-xs font-bold">{account}</span>
            {isVerified(account) && (
              <BadgeCheck className="si-verified h-3.5 w-3.5 shrink-0" aria-label="인증 계정" />
            )}
          </div>
          <div className="text-[10px] text-muted-foreground">{categoryLabel}</div>
        </div>
        <button type="button" className="si-follow-btn shrink-0" tabIndex={-1}>
          팔로우
        </button>
        <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </div>

      {/* 미디어 영역 (이모지 타일) */}
      <div className="si-photo relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden">
        <span className="select-none text-6xl">{history.icon}</span>
        <span className="absolute right-2 top-2 rounded-md bg-foreground/70 px-1.5 py-0.5 text-[10px] font-bold text-background">
          {history.mediaType}
        </span>
        <span className="si-accent-text absolute bottom-2 left-2 animate-pop rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold shadow">
          💖 친구가 방금 좋아요를 눌렀어요!
        </span>
      </div>

      {/* 액션 줄: 하트(눌린 상태)·말풍선·종이비행기 | 북마크 */}
      <div className="flex items-center justify-between px-3 pt-2" aria-hidden="true">
        <div className="flex items-center gap-3.5">
          <Heart className="si-heart-liked h-6 w-6 animate-pop" strokeWidth={1.9} />
          <MessageCircle className="h-6 w-6 text-foreground" strokeWidth={1.9} />
          <Send className="h-6 w-6 text-foreground" strokeWidth={1.9} />
        </div>
        <Bookmark className="h-6 w-6 text-foreground" strokeWidth={1.9} />
      </div>

      {/* 좋아요 수 · 캡션 · 댓글 · 시간 */}
      <div className="px-3 pb-2.5 pt-1 text-left">
        <div className="text-xs font-bold">
          좋아요 {likeCount.toLocaleString("ko-KR")}개
        </div>
        <p className="mt-0.5 text-xs leading-snug">
          <span className="font-bold">{account}</span> {history.title}{" "}
          <span className="si-hashtag">{history.tags}</span>
        </p>
        <div className="mt-0.5 text-[10px] text-muted-foreground">
          댓글 {commentCount}개 모두 보기
        </div>
        <div className="mt-0.5 text-[9px] text-muted-foreground">{hoursAgo}시간 전</div>
      </div>
    </article>
  );
}

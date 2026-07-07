/**
 * 파트 A — 누리피드를 써 봐요.
 * 좋아요·열어보기·검색 칩 탭이 각각 데이터 조각 1개로 기록된다(메모리 전용).
 * 목표 개수(actionGoal)를 채우면 행동이 잠기고 "그만 쓰기" 배너가 뜬다.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search, ChevronDown, ChevronUp, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DtContent, DtPost, DtSearchChip } from "./types";
import type { DataTrailGame } from "./useDataTrailGame";

interface FeedScreenProps {
  content: DtContent;
  game: DataTrailGame;
}

export default function FeedScreen({ content, game }: FeedScreenProps) {
  const { feed, meta } = content;
  const { log, goal, goalReached, addAction, goJourney } = game;

  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [openedIds, setOpenedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [usedChips, setUsedChips] = useState<string[]>([]);
  const [activeChip, setActiveChip] = useState<DtSearchChip | null>(null);

  const handleLike = (post: DtPost) => {
    if (goalReached || likedIds.includes(post.id)) return;
    setLikedIds((prev) => [...prev, post.id]);
    addAction("like", post.title, post.tags);
  };

  const handleOpen = (post: DtPost) => {
    // 펼치기/접기는 자유지만, 데이터 조각은 게시물당 1번만 남는다.
    setExpandedId((prev) => (prev === post.id ? null : post.id));
    if (goalReached || openedIds.includes(post.id)) return;
    setOpenedIds((prev) => [...prev, post.id]);
    addAction("open", post.title, post.tags);
  };

  const handleChip = (chip: DtSearchChip) => {
    if (goalReached || usedChips.includes(chip.label)) return;
    setUsedChips((prev) => [...prev, chip.label]);
    setActiveChip(chip);
    addAction("search", chip.label, chip.tags);
  };

  /** 검색 칩을 누르면 관련 태그 게시물이 위로 올라온다 — 검색의 느낌만 흉내 */
  const sortedPosts = useMemo(() => {
    if (!activeChip) return feed.posts;
    const matches = (post: DtPost) => post.tags.some((t) => activeChip.tags.includes(t));
    return [...feed.posts].sort((a, b) => Number(matches(b)) - Number(matches(a)));
  }, [feed.posts, activeChip]);

  return (
    <div className="dt-screen pb-28">
      <div className="container max-w-2xl py-5">
        {/* 상단: 안내 + 데이터 조각 카운터 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">📱 {meta.appName}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{feed.instruction}</p>
          </div>
          {/* key로 리마운트해 조각이 늘 때마다 톡 튀게 한다 */}
          <span
            key={log.length}
            className="dt-counter dt-counter-pop inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold"
          >
            <Footprints className="h-4 w-4" />
            {feed.counterLabel}: {log.length}개 / {goal}개
          </span>
        </div>

        {/* 검색 칩 */}
        <div className="mlq-card mt-4 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            무엇을 찾아볼까요? 검색 칩을 눌러 보세요
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {feed.searchChips.map((chip) => {
              const used = usedChips.includes(chip.label);
              return (
                <button
                  key={chip.label}
                  type="button"
                  disabled={used || goalReached}
                  onClick={() => handleChip(chip)}
                  className={cn("dt-chip px-3 py-1.5 text-sm", used && "dt-chip-used")}
                >
                  {used ? "✓ " : "🔍 "}
                  {chip.label}
                </button>
              );
            })}
          </div>
          {activeChip && (
            <p className="mt-2 text-xs text-muted-foreground">
              ‘{activeChip.label}’을(를) 검색해서 관련 게시물을 위로 올렸어요.
            </p>
          )}
        </div>

        {/* 피드 */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {sortedPosts.map((post) => {
            const liked = likedIds.includes(post.id);
            const expanded = expandedId === post.id;
            return (
              <div key={post.id} className="dt-post mlq-card p-4">
                <div className="flex items-start gap-3">
                  <span className="mlq-emoji-tile dt-post-tile h-12 w-12 shrink-0 text-2xl">
                    {post.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-snug">{post.title}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 overflow-hidden text-xs leading-relaxed text-muted-foreground"
                    >
                      {post.detail}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={liked || goalReached}
                    onClick={() => handleLike(post)}
                    className={cn(
                      "dt-btn flex-1 px-2 py-1.5 text-xs",
                      liked ? "dt-like-on" : "dt-btn-outline",
                    )}
                  >
                    <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
                    {liked ? "좋아요 완료" : "좋아요"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpen(post)}
                    className="dt-btn dt-btn-outline flex-1 px-2 py-1.5 text-xs"
                  >
                    {expanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    {expanded ? "접기" : "열어보기"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 목표 달성 배너 — 그만 쓰기 → 파트 B */}
      <AnimatePresence>
        {goalReached && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="dt-banner fixed inset-x-0 bottom-0 z-40 backdrop-blur"
          >
            <div className="container flex max-w-2xl flex-wrap items-center justify-between gap-3 py-3">
              <p className="text-sm font-semibold">✨ {feed.goalBanner}</p>
              <button
                type="button"
                onClick={goJourney}
                className="dt-btn dt-btn-primary px-5 py-2.5 text-sm"
              >
                {feed.stopButton} →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

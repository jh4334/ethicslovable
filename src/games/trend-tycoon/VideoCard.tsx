import { motion } from "framer-motion";
import { AlertCircle, BookOpen, Gamepad2, Hash, Heart, MousePointer, Play, ShoppingBag, Tv } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RankedVideo } from "./types";

interface VideoCardProps {
  video: RankedVideo;
  rank: number;
  isHighlighted?: boolean;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "게임":
      return <Gamepad2 size={12} aria-hidden />;
    case "학습":
      return <BookOpen size={12} aria-hidden />;
    case "뉴스":
      return <Tv size={12} aria-hidden />;
    case "광고":
      return <ShoppingBag size={12} aria-hidden />;
    default:
      return <Play size={12} aria-hidden />;
  }
}

function getCategoryClass(category: string) {
  switch (category) {
    case "게임":
      return "tt-cat-game";
    case "학습":
      return "tt-cat-learning";
    case "뉴스":
      return "tt-cat-news";
    case "광고":
      return "tt-cat-ad";
    default:
      return "tt-cat-news";
  }
}

/** 콘텐츠 JSON 의 color 값 → 썸네일 배경 클래스 (모르는 값은 회색) */
const THUMB_COLORS = new Set([
  "blue", "indigo", "violet", "pink", "rose", "red", "orange", "amber",
  "yellow", "lime", "green", "teal", "cyan", "sky", "gray", "dark",
]);

function getThumbClass(color: string) {
  return THUMB_COLORS.has(color) ? `tt-thumb-${color}` : "tt-thumb-gray";
}

/** 추천 피드의 영상 카드 — 순위가 바뀌면 framer-motion 이 부드럽게 재배치한다 */
export default function VideoCard({ video, rank, isHighlighted }: VideoCardProps) {
  const isTopRank = rank <= 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: rank * 0.02 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-md transition-shadow duration-300 hover:shadow-xl",
        isHighlighted ? "ring-2 ring-success ring-offset-2" : "border-border"
      )}
    >
      {/* 순위 배지 */}
      <div
        className={cn(
          "absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full font-bold shadow-lg",
          isTopRank ? "tt-rank-top" : "tt-rank"
        )}
      >
        {rank}
      </div>

      {/* 썸네일 */}
      <div className={cn("relative flex h-36 flex-col items-center justify-center overflow-hidden", getThumbClass(video.color))}>
        <motion.span
          className="text-5xl drop-shadow-md"
          whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.3 }}
        >
          {video.emoji}
        </motion.span>
        {/* 재생 시간 */}
        <div className="absolute bottom-2 right-2 rounded bg-foreground/80 px-1.5 py-0.5 font-mono text-[10px] text-background">
          {Math.floor(video.watchTime / 60)}:{String(video.watchTime % 60).padStart(2, "0")}
        </div>
        {video.category === "광고" && (
          <div className="absolute right-2 top-2 rounded bg-warning px-1.5 py-0.5 text-[10px] font-bold text-warning-foreground">
            광고
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="mb-2 h-10 text-sm font-bold leading-tight text-card-foreground line-clamp-2">{video.title}</h3>

        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className={cn("flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold", getCategoryClass(video.category))}>
            {getCategoryIcon(video.category)} {video.category}
          </span>
          {video.intensity >= 4 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-destructive">
              <AlertCircle size={10} aria-hidden /> 자극적
            </span>
          )}
        </div>

        {/* 해시태그 */}
        <div className="mb-2 flex flex-wrap items-center gap-1">
          {video.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="flex items-center gap-0.5 rounded bg-muted/70 px-1.5 py-0.5 text-[9px] text-muted-foreground">
              <Hash size={8} aria-hidden />
              {tag}
            </span>
          ))}
        </div>

        {/* 스탯 */}
        <div className="mt-auto grid grid-cols-2 gap-1 rounded bg-muted/50 p-1.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <MousePointer size={10} aria-hidden /> {video.clicks.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <Heart size={10} aria-hidden /> {video.likes.toLocaleString()}
          </div>
        </div>

        {/* 알고리즘 점수 */}
        <div className="mt-2 flex items-end justify-between border-t border-border pt-2">
          <span className="text-[10px] text-muted-foreground">점수</span>
          <span className="font-mono text-sm font-bold text-primary">{Math.round(video.score).toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}

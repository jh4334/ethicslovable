import { motion } from "framer-motion";
import { AlertCircle, BookOpen, Gamepad2, Heart, MoreVertical, Play, ShoppingBag, Tv } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RankedVideo } from "./types";

interface VideoCardProps {
  video: RankedVideo;
  rank: number;
  isHighlighted?: boolean;
}

/*
 * ---------- 표시 전용 파생 데이터 ----------
 * 실제 동영상 플랫폼 홈 화면처럼 보이게 하는 채널명·업로드 시점·조회수 표기.
 * 모두 콘텐츠 JSON의 기존 값(id, category, clicks)에서 결정적으로 계산하며
 * 순위·점수·미션 판정에는 전혀 쓰이지 않는다.
 */

/** 카테고리 → 가상 채널 (전부 지어낸 이름 — 실제 서비스·상표와 무관) */
const CHANNELS: Record<string, { name: string; emoji: string; tint: string }> = {
  게임: { name: "네모게임즈", emoji: "🎮", tint: "tt-avatar-game" },
  학습: { name: "호기심교실", emoji: "🔬", tint: "tt-avatar-learning" },
  뉴스: { name: "누리마을 뉴스", emoji: "📰", tint: "tt-avatar-news" },
  광고: { name: "(광고)", emoji: "📢", tint: "tt-avatar-ad" },
};
const DEFAULT_CHANNEL = { name: "누리 크리에이터", emoji: "📺", tint: "tt-avatar-news" };

function getChannel(category: string) {
  return CHANNELS[category] ?? DEFAULT_CHANNEL;
}

/** 업로드 시점 "N일 전" — 영상 id에서 결정적으로 파생 (1~28일) */
function getDaysAgo(id: number) {
  return ((id * 7) % 28) + 1;
}

/** 조회수 표기 — 기존 clicks 수치를 그대로 "조회수 N회 / N만회"로 포맷만 바꾼다 */
function formatViews(clicks: number) {
  if (clicks >= 10000) {
    const man = clicks / 10000;
    return `조회수 ${Number.isInteger(man) ? man : man.toFixed(1)}만회`;
  }
  return `조회수 ${clicks.toLocaleString()}회`;
}

/** hover 진행바 힌트의 폭(%) — id에서 결정적으로 파생 (20~80%) */
function getProgressHint(id: number) {
  return ((id * 13) % 61) + 20;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "게임":
      return <Gamepad2 size={10} aria-hidden />;
    case "학습":
      return <BookOpen size={10} aria-hidden />;
    case "뉴스":
      return <Tv size={10} aria-hidden />;
    case "광고":
      return <ShoppingBag size={10} aria-hidden />;
    default:
      return <Play size={10} aria-hidden />;
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

/** 상위 3위 카드에 씌우는 금/은/동 링 클래스 */
const MEDAL_CLASSES = ["tt-medal-gold", "tt-medal-silver", "tt-medal-bronze"];

/** 추천 피드의 영상 카드 — 순위가 바뀌면 framer-motion 이 부드럽게 재배치한다 */
export default function VideoCard({ video, rank, isHighlighted }: VideoCardProps) {
  const isTopRank = rank <= 3;
  const isAd = video.category === "광고";
  const channel = getChannel(video.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: rank * 0.02 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow duration-300",
        // tt-video-card 의 커스텀 그림자가 tailwind ring(box-shadow)을 덮지 않도록,
        // 미션 달성 하이라이트 중에는 tailwind 유틸리티만 사용한다
        isHighlighted
          ? "border-success/40 shadow-md ring-2 ring-success ring-offset-2"
          : cn("tt-video-card", isTopRank ? MEDAL_CLASSES[rank - 1] : "border-border")
      )}
    >
      {/* 순위 배지 */}
      <div
        className={cn(
          "absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full font-black tabular-nums",
          isTopRank ? "tt-rank-top" : "tt-rank"
        )}
      >
        {rank}
      </div>

      {/* 썸네일 — 16:9 */}
      <div className={cn("relative flex aspect-video flex-col items-center justify-center overflow-hidden", getThumbClass(video.color))}>
        <motion.span
          className="text-5xl drop-shadow-md"
          whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.3 }}
        >
          {video.emoji}
        </motion.span>
        {/* 재생 시간 배지 (우하단) */}
        <div className="absolute bottom-2 right-2 rounded bg-foreground/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-background">
          {Math.floor(video.watchTime / 60)}:{String(video.watchTime % 60).padStart(2, "0")}
        </div>
        {isAd && (
          <div className="absolute right-2 top-2 rounded bg-warning px-1.5 py-0.5 text-[10px] font-bold text-warning-foreground">
            광고
          </div>
        )}
        {/* hover 시 얇은 진행바 힌트 (장식 — 폭은 id에서 파생) */}
        <div
          className="tt-progress-hint absolute bottom-0 left-0 h-[3px]"
          style={{ width: `${getProgressHint(video.id)}%` }}
          aria-hidden
        />
      </div>

      {/* 정보 영역 — 동영상 앱 문법: [채널 아바타] 제목 + 메타 라인 + ··· */}
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start gap-2.5">
          <div className={cn("tt-avatar", channel.tint)} title={channel.name} aria-hidden>
            {channel.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 min-h-9 text-sm font-bold leading-tight text-card-foreground line-clamp-2">
              {video.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] text-muted-foreground">
              {isAd ? (
                <span className="tt-ad-chip">광고</span>
              ) : (
                <span className="max-w-full truncate font-semibold">{channel.name}</span>
              )}
              <span aria-hidden>·</span>
              <span>{formatViews(video.clicks)}</span>
              <span aria-hidden>·</span>
              <span>{getDaysAgo(video.id)}일 전</span>
            </div>
          </div>
          <MoreVertical size={16} className="mt-0.5 shrink-0 text-muted-foreground/60" aria-hidden />
        </div>

        {/* 알고리즘 점수 스트립 — 플랫폼 화면 위에 겹친 '연구소장 전용' 분석 도구 */}
        <div className="tt-score-strip mt-3 rounded-lg px-2.5 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-muted-foreground">🔍 알고리즘 점수</span>
            <span className="text-sm font-extrabold tabular-nums text-primary">
              {Math.round(video.score).toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className={cn("flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-extrabold", getCategoryClass(video.category))}>
              {getCategoryIcon(video.category)} {video.category}
            </span>
            <span className="flex items-center gap-0.5 font-semibold">
              <Heart size={9} aria-hidden /> {video.likes.toLocaleString()}
            </span>
            {video.intensity >= 4 && (
              <span className="tt-chip-hot flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-extrabold">
                <AlertCircle size={9} aria-hidden /> 자극적
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

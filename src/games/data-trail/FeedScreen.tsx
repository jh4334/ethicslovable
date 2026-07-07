/**
 * 파트 A — 누리피드를 써 봐요.
 * 진짜 SNS처럼 보이는 '폰 화면' 안에서 하트(좋아요)·더 보기(열어보기)·검색 칩 탭이
 * 각각 데이터 조각 1개로 기록된다(메모리 전용, 핸들러·로그 로직은 그대로).
 * 폰 프레임 밖에는 '데이터 여행자 시점' 관찰 바(조각 카운터)를 둬서
 * 앱 화면(안)과 데이터 추적(밖)의 대비 — 이 게임의 교육 포인트 — 를 살린다.
 *
 * 계정명·좋아요 수·시간은 게시물 category/index에서 파생한 화면용 가짜 데이터로,
 * 분석 로직에는 전혀 쓰이지 않는다. 브랜드는 자체 제작 '누리피드'(청록→보라)뿐이다.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Battery,
  Bookmark,
  CircleUserRound,
  Footprints,
  Heart,
  Home,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  Signal,
  SquarePlus,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DtContent, DtPost, DtSearchChip } from "./types";
import type { DataTrailGame } from "./useDataTrailGame";

interface FeedScreenProps {
  content: DtContent;
  game: DataTrailGame;
}

/** 게시물 category → 화면용 가짜 계정 (표시 전용, 로직 미사용) */
const CATEGORY_ACCOUNTS: Record<string, { name: string; emoji: string }> = {
  동물: { name: "몽실이집사", emoji: "🐾" },
  게임: { name: "네모게임즈", emoji: "🎮" },
  요리: { name: "요리왕뚝딱", emoji: "🍳" },
  운동: { name: "체육쌤", emoji: "🏃" },
  과학: { name: "과학쌤호기심", emoji: "🔬" },
  패션: { name: "오늘의꾸밈왕", emoji: "🎀" },
};
const FALLBACK_ACCOUNT = { name: "누리프렌즈", emoji: "✨" };

const accountOf = (category: string) => CATEGORY_ACCOUNTS[category] ?? FALLBACK_ACCOUNT;

/** 게시물 category → 미디어 타일 색상(hue) — 피드에 색 변화를 준다 */
const MEDIA_HUES: Record<string, number> = {
  동물: 28,
  게임: 252,
  요리: 36,
  운동: 152,
  과학: 199,
  패션: 322,
};

/** 하단 탭(장식) — 눌러도 이동하지 않고 "흉내예요" 토스트만 띄운다 */
const TABS = [
  { label: "홈", Icon: Home, active: true },
  { label: "검색", Icon: Search, active: false },
  { label: "만들기", Icon: SquarePlus, active: false },
  { label: "알림", Icon: Heart, active: false },
  { label: "내정보", Icon: CircleUserRound, active: false },
];

/** 누리피드 자체 로고 — 청록→보라 둥근 사각형 + 반짝임 별 (실제 SNS 상표와 무관한 자작 도형) */
function NuriFeedLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" role="img" aria-label="누리피드 로고">
      <defs>
        <linearGradient id="dt-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(174 62% 42%)" />
          <stop offset="100%" stopColor="hsl(258 82% 62%)" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="url(#dt-brand-grad)" />
      <path
        d="M11.4 5.6 L12.9 10.5 L17.8 12 L12.9 13.5 L11.4 18.4 L9.9 13.5 L5 12 L9.9 10.5 Z"
        fill="#fff"
      />
      <path
        d="M17.6 5.2 L18.2 6.9 L19.9 7.5 L18.2 8.1 L17.6 9.8 L17 8.1 L15.3 7.5 L17 6.9 Z"
        fill="#fff"
        opacity="0.85"
      />
    </svg>
  );
}

export default function FeedScreen({ content, game }: FeedScreenProps) {
  const { feed, meta } = content;
  const { log, goal, goalReached, addAction, goJourney } = game;

  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [openedIds, setOpenedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [usedChips, setUsedChips] = useState<string[]>([]);
  const [activeChip, setActiveChip] = useState<DtSearchChip | null>(null);

  // 장식 버튼(탭바·말풍선 등)을 누르면 "흉내예요" 토스트 + 탭바가 살짝 흔들린다
  const [mimicTick, setMimicTick] = useState(0);
  const [mimicVisible, setMimicVisible] = useState(false);
  const mimicTimer = useRef<number | null>(null);

  const showMimic = () => {
    setMimicTick((t) => t + 1);
    setMimicVisible(true);
    if (mimicTimer.current !== null) window.clearTimeout(mimicTimer.current);
    mimicTimer.current = window.setTimeout(() => setMimicVisible(false), 1500);
  };

  useEffect(
    () => () => {
      if (mimicTimer.current !== null) window.clearTimeout(mimicTimer.current);
    },
    [],
  );

  const handleLike = (post: DtPost) => {
    if (goalReached || likedIds.includes(post.id)) return;
    setLikedIds((prev) => [...prev, post.id]);
    addAction("like", post.title, post.tags);
  };

  const handleOpen = (post: DtPost) => {
    // 펼치기(더 보기)/접기는 자유지만, 데이터 조각은 게시물당 1번만 남는다.
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

  /** 화면용 가짜 좋아요 수·게시 시간 — 원래 게시물 순서(index) 기반 결정적 값 */
  const displayMeta = useMemo(() => {
    const map = new Map<string, { likes: number; hoursAgo: number }>();
    feed.posts.forEach((post, i) => {
      map.set(post.id, { likes: 46 + ((i * 37) % 130), hoursAgo: ((i * 5) % 21) + 1 });
    });
    return map;
  }, [feed.posts]);

  /** 스토리 줄 — 파생 계정을 등장 순서대로 한 번씩 */
  const storyAccounts = useMemo(() => {
    const seen = new Set<string>();
    const list: { name: string; emoji: string }[] = [];
    for (const post of feed.posts) {
      const acc = accountOf(post.category);
      if (!seen.has(acc.name)) {
        seen.add(acc.name);
        list.push(acc);
      }
    }
    return list;
  }, [feed.posts]);

  return (
    <div className="dt-screen pb-32">
      <div className="container max-w-2xl py-4">
        {/* ── 폰 밖: 데이터 여행자(관찰자) 시점 바 — 조각 카운터는 반드시 앱 밖에 둔다 ── */}
        <div className="dt-observer sticky top-12 z-30 mx-auto mb-4 flex max-w-[420px] flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-2xl px-3.5 py-2.5">
          <div className="min-w-0 flex-1 basis-52">
            <p className="text-[11px] font-extrabold text-[hsl(262_55%_42%)]">
              🔭 데이터 여행자 시점 — 폰 밖에서 관찰 중
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {feed.instruction}
            </p>
          </div>
          {/* key로 리마운트해 조각이 늘 때마다 톡 튀게 한다 */}
          <span
            key={log.length}
            className="dt-counter dt-counter-pop inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
          >
            <Footprints className="h-3.5 w-3.5" />
            {feed.counterLabel}: {log.length}개 / {goal}개
          </span>
        </div>

        {/* ── 폰 프레임: 이 안쪽이 전부 '누리피드 앱 화면' ── */}
        <div className="dt-phone mx-auto w-full max-w-[420px]">
          {/* 일반 상태 표시줄 */}
          <div className="dt-status" aria-hidden>
            <span>9:24</span>
            <span className="flex items-center gap-1">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </span>
          </div>

          {/* 앱 상단 바 — 워드마크 + 알림·메시지 아이콘(장식) */}
          <header className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="flex items-center gap-1.5">
              <NuriFeedLogo />
              <span className="dt-wordmark text-lg font-extrabold">{meta.appName}</span>
            </span>
            <span className="flex items-center">
              <button
                type="button"
                onClick={showMimic}
                title="이 버튼은 흉내예요"
                aria-label="알림 (게임 속 흉내)"
                className="dt-sns-icon-btn"
              >
                <Heart className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={showMimic}
                title="이 버튼은 흉내예요"
                aria-label="메시지 보내기 (게임 속 흉내)"
                className="dt-sns-icon-btn"
              >
                <Send className="h-5 w-5" />
              </button>
            </span>
          </header>

          {/* 스토리 줄 — 그라디언트 링 아바타 */}
          <div className="flex gap-3 overflow-x-auto border-b border-border px-3 py-2.5">
            <div className="flex w-14 shrink-0 flex-col items-center gap-1">
              <span className="dt-story-ring dt-story-me">
                <span className="dt-story-avatar">🙂</span>
                <span className="dt-story-plus" aria-hidden>
                  +
                </span>
              </span>
              <span className="w-full truncate text-center text-[10px] font-semibold">
                내 스토리
              </span>
            </div>
            {storyAccounts.map((acc) => (
              <div key={acc.name} className="flex w-14 shrink-0 flex-col items-center gap-1">
                <span className="dt-story-ring">
                  <span className="dt-story-avatar">{acc.emoji}</span>
                </span>
                <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                  {acc.name}
                </span>
              </div>
            ))}
          </div>

          {/* 검색 영역 — SNS 검색창 + 추천 검색 칩(누르면 데이터 조각 기록) */}
          <div className="border-b border-border px-3 pb-2.5 pt-3">
            <div className="dt-searchbar flex items-center gap-2 px-3.5 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-xs text-muted-foreground">
                무엇을 찾아볼까요? 아래 추천 검색어를 눌러 보세요
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {feed.searchChips.map((chip) => {
                const used = usedChips.includes(chip.label);
                return (
                  <button
                    key={chip.label}
                    type="button"
                    disabled={used || goalReached}
                    onClick={() => handleChip(chip)}
                    className={cn("dt-chip px-3 py-1.5 text-xs", used && "dt-chip-used")}
                  >
                    {used ? "✓ " : "🔍 "}
                    {chip.label}
                  </button>
                );
              })}
            </div>
            {activeChip && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                ‘{activeChip.label}’을(를) 검색해서 관련 게시물을 위로 올렸어요.
              </p>
            )}
          </div>

          {/* 피드 — SNS 게시물 카드 */}
          <div>
            {sortedPosts.map((post) => {
              const liked = likedIds.includes(post.id);
              const expanded = expandedId === post.id;
              const acc = accountOf(post.category);
              const info = displayMeta.get(post.id) ?? { likes: 50, hoursAgo: 3 };
              const likeCount = info.likes + (liked ? 1 : 0);
              const hue = MEDIA_HUES[post.category] ?? 174;
              return (
                <article
                  key={post.id}
                  className="dt-sns-post"
                  style={{ "--dt-media-hue": hue } as CSSProperties}
                >
                  {/* 게시물 헤더: 아바타 + 계정명 + ··· */}
                  <header className="flex items-center gap-2.5 px-3 py-2">
                    <span className="dt-sns-avatar" aria-hidden>
                      {acc.emoji}
                    </span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate text-[13px] font-bold">{acc.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        누리마을 · {info.hoursAgo}시간 전
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={showMimic}
                      title="이 버튼은 흉내예요"
                      aria-label="게시물 메뉴 (게임 속 흉내)"
                      className="dt-sns-icon-btn h-8 w-8"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </header>

                  {/* 미디어(이모지) */}
                  <div className="dt-media">
                    <span className="select-none text-6xl drop-shadow-sm" aria-hidden>
                      {post.emoji}
                    </span>
                  </div>

                  {/* 액션 줄: 하트(좋아요 기록) · 말풍선/공유/북마크(장식) */}
                  <div className="flex items-center gap-0.5 px-1.5 pt-1">
                    <button
                      type="button"
                      disabled={liked || goalReached}
                      onClick={() => handleLike(post)}
                      aria-label={liked ? "좋아요 완료" : "좋아요"}
                      className={cn("dt-sns-icon-btn", liked && "dt-heart-on")}
                    >
                      <Heart className={cn("h-6 w-6", liked && "fill-current")} />
                    </button>
                    <button
                      type="button"
                      onClick={showMimic}
                      title="이 버튼은 흉내예요"
                      aria-label="댓글 (게임 속 흉내)"
                      className="dt-sns-icon-btn"
                    >
                      <MessageCircle className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={showMimic}
                      title="이 버튼은 흉내예요"
                      aria-label="공유 (게임 속 흉내)"
                      className="dt-sns-icon-btn"
                    >
                      <Send className="h-6 w-6" />
                    </button>
                    <span className="flex-1" />
                    <button
                      type="button"
                      onClick={showMimic}
                      title="이 버튼은 흉내예요"
                      aria-label="북마크 (게임 속 흉내)"
                      className="dt-sns-icon-btn"
                    >
                      <Bookmark className="h-6 w-6" />
                    </button>
                  </div>

                  {/* 좋아요 수 + 캡션(계정명·제목·파란 해시태그) + 더 보기(열어보기 기록) */}
                  <div className="px-3 pb-3">
                    <p className="text-[13px] font-bold tabular-nums">
                      좋아요 {likeCount.toLocaleString("ko-KR")}개
                    </p>
                    <p className="mt-0.5 text-[13px] leading-snug">
                      <span className="font-bold">{acc.name}</span> {post.title}{" "}
                      {post.tags.map((tag) => (
                        <span key={tag} className="dt-hashtag">
                          #{tag}{" "}
                        </span>
                      ))}
                    </p>
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-1 overflow-hidden text-xs leading-relaxed text-muted-foreground"
                        >
                          {post.detail}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <button
                      type="button"
                      onClick={() => handleOpen(post)}
                      className="dt-more-btn mt-1 text-xs font-semibold text-muted-foreground"
                    >
                      {expanded ? "접기" : "… 더 보기"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* 하단 탭 바(장식) — 눌러도 이동하지 않는다 */}
          <div className="dt-tabwrap">
            <AnimatePresence>
              {mimicVisible && (
                <motion.p
                  initial={{ opacity: 0, y: 6, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 6, x: "-50%" }}
                  className="dt-mimic-toast"
                  role="status"
                >
                  📱 게임 속 흉내예요 — 진짜로 이동하지 않아요
                </motion.p>
              )}
            </AnimatePresence>
            <nav
              key={mimicTick}
              className={cn("dt-tabbar", mimicTick > 0 && "dt-wiggle")}
              aria-label="누리피드 하단 탭 (게임 속 흉내)"
            >
              {TABS.map(({ label, Icon, active }) => (
                <button
                  key={label}
                  type="button"
                  onClick={showMimic}
                  className={cn("dt-tab", active && "dt-tab-active")}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
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

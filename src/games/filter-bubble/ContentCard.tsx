import { getCategoryMeta } from "./categoryMeta";
import { fakeDuration, fakeViewCount } from "./logic";
import type { Category, ContentItem } from "./types";

interface ContentCardProps {
  item: ContentItem;
  category: Category;
  onClick: (item: ContentItem) => void;
}

/**
 * 영상 앱 홈 화면의 썸네일 카드 모양.
 * 썸네일(파스텔 그라디언트 + 큰 이모지 + 재생시간)과
 * 채널 아바타 · 제목 · 조회수 메타 줄로 구성한다.
 * 조회수·재생시간은 아이템 id 기반 결정값이라 렌더링마다 바뀌지 않는다.
 */
export function ContentCard({ item, category, onClick }: ContentCardProps) {
  const meta = getCategoryMeta(category.id);

  const viewCount = fakeViewCount(item.id);
  const duration = fakeDuration(item.id);
  const isHot = item.intensity >= 4;

  return (
    <div
      onClick={() => onClick(item)}
      className="fb-card-interactive relative flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-soft"
    >
      {/* 썸네일 영역 */}
      <div className={`fb-thumb relative aspect-video w-full flex-none ${meta.thumbClass}`}>
        <span className="fb-thumb-emoji" aria-hidden="true">
          {meta.emoji}
        </span>

        {/* 호버 시 나타나는 중립형 재생 버튼(반투명 흰 원 + 삼각형) */}
        <span className="fb-play-overlay" aria-hidden="true">
          <span className="fb-play-circle">
            <span className="fb-play-triangle" />
          </span>
        </span>

        {/* 분야 칩 */}
        <span
          className={`absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold ${meta.badgeClass}`}
        >
          {category.label}
        </span>

        {/* 자극 정도 배지 (교육 장치) — 4 이상이면 🔥와 빨간 점 */}
        <span className="fb-heat-badge absolute right-1.5 top-1.5">
          {isHot && <span aria-hidden="true">🔥</span>}
          <span className="fb-heat-dots">
            {Array.from({ length: item.intensity }).map((_, i) => (
              <span
                key={i}
                className={`fb-heat-dot ${isHot ? "fb-intensity-high" : "fb-intensity-normal"}`}
              />
            ))}
          </span>
        </span>

        {/* 재생시간 배지 */}
        <span className="fb-duration absolute bottom-1.5 right-1.5">{duration}</span>
      </div>

      {/* 제목 · 채널 메타 영역 */}
      <div className="flex min-h-0 flex-1 gap-2 px-2.5 pb-2.5 pt-2">
        <span className={`fb-avatar flex-none ${meta.badgeClass}`} aria-hidden="true">
          {meta.channelEmoji}
        </span>
        <div className="min-w-0">
          <h3 className="fb-clamp-2 text-xs font-bold leading-snug text-card-foreground sm:text-[13px]">
            {item.title}
          </h3>
          <div className="mt-1 truncate text-[10px] text-muted-foreground">
            {meta.channelName} · 조회수 {viewCount}만회
          </div>
        </div>
      </div>

      {/* 자극이 아주 강한 카드 표시 줄 */}
      {item.intensity >= 5 && <div className="fb-hot-bar absolute bottom-0 h-1 w-full" />}
    </div>
  );
}

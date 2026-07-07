import { Search } from "lucide-react";
import { ContentCard } from "./ContentCard";
import { TOTAL_ROUNDS } from "./useAlgorithmGame";
import type { Category, ContentItem } from "./types";

interface GameScreenProps {
  feed: ContentItem[];
  clicks: number;
  categories: Category[];
  onCardClick: (item: ContentItem) => void;
}

export function GameScreen({ feed, clicks, categories, onCardClick }: GameScreenProps) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="fb-screen flex flex-col items-center p-4">
      <div className="w-full max-w-xl space-y-4">
        {/* 상단 바 — 영상 앱 홈 화면 모양(워드마크·검색창·칩은 장식, 클릭 없음) */}
        <div className="mlq-card sticky top-14 z-20 space-y-2 p-3">
          <div className="flex items-center gap-2.5">
            <div className="fb-wordmark flex-none">
              <span className="fb-wordmark-play" aria-hidden="true" />
              <span className="fb-wordmark-text">누리TV</span>
            </div>
            <div className="fb-searchbar min-w-0 flex-1" aria-hidden="true">
              <Search size={13} className="flex-none" />
              <span className="truncate">보고 싶은 영상 검색</span>
            </div>
            <div className="fb-progress-pill flex-none">
              {clicks}
              <span className="fb-progress-total">/{TOTAL_ROUNDS}</span>
            </div>
          </div>

          {/* 카테고리 칩 행 (장식) */}
          <div className="fb-chip-row" aria-hidden="true">
            <span className="fb-chip fb-chip-active">전체</span>
            {categories.map((c) => (
              <span key={c.id} className="fb-chip">
                {c.label}
              </span>
            ))}
          </div>

          <div className="text-[11px] font-medium text-muted-foreground">
            맞춤 추천 · 무엇을 보고 싶나요? {categories.length}개 분야의 영상이 똑같이 나와요
          </div>
        </div>

        {/* 추천 영상 그리드 */}
        <div className="grid grid-cols-2 gap-3 pb-10 sm:grid-cols-4" key={clicks}>
          {feed.map((item, index) => {
            const category = categoryById.get(item.category);
            if (!category) return null;
            return (
              <div
                key={`${item.id}-${clicks}`}
                className="fb-card-stagger"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <ContentCard item={item} category={category} onClick={onCardClick} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

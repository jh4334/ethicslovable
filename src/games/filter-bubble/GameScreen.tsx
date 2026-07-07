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
        {/* 상단 안내 */}
        <div className="sticky top-14 z-20 flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-card-foreground">무엇을 보고 싶나요?</h2>
            <div className="text-xs text-muted-foreground">
              {categories.length}개 분야의 정보가 똑같이 나와요
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="font-mono text-2xl font-black text-foreground">
              {clicks}
              <span className="text-base text-muted-foreground">/{TOTAL_ROUNDS}</span>
            </div>
          </div>
        </div>

        {/* 카드 피드 */}
        <div className="grid grid-cols-2 gap-3 pb-10 sm:grid-cols-4" key={clicks}>
          {feed.map((item, index) => {
            const category = categoryById.get(item.category);
            if (!category) return null;
            return (
              <div
                key={`${item.id}-${clicks}`}
                className="fb-card-stagger aspect-[4/5]"
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

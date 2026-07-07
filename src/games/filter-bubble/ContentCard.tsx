import { getCategoryMeta } from "./categoryMeta";
import { fakeViewCount } from "./logic";
import type { Category, ContentItem } from "./types";

interface ContentCardProps {
  item: ContentItem;
  category: Category;
  onClick: (item: ContentItem) => void;
}

export function ContentCard({ item, category, onClick }: ContentCardProps) {
  const meta = getCategoryMeta(category.id);
  const CatIcon = meta.icon;

  // 가짜 조회수 — 아이템 id에서 결정되므로 렌더링마다 바뀌지 않는다
  const viewCount = fakeViewCount(item.id);

  return (
    <div
      onClick={() => onClick(item)}
      className="fb-card-interactive relative h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      {/* 분야 배지 */}
      <div
        className={`absolute left-3 top-3 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${meta.badgeClass}`}
      >
        <CatIcon size={10} />
        {category.label}
      </div>

      {/* 카드 내용 */}
      <div className="flex h-full min-h-[120px] flex-col justify-between px-4 pb-4 pt-10">
        <h3 className="mb-2 text-sm font-semibold leading-snug text-card-foreground">
          {item.title}
        </h3>
        <div className="mt-auto flex items-center justify-between">
          <div className="text-[10px] text-muted-foreground">조회수 {viewCount}만회</div>
          {/* 자극 정도 표시 점 */}
          <div className="flex gap-0.5">
            {Array.from({ length: item.intensity }).map((_, i) => (
              <div
                key={i}
                className={`h-1 w-1 rounded-full ${
                  item.intensity >= 4 ? "fb-intensity-high" : "fb-intensity-normal"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 자극이 아주 강한 카드 표시 줄 */}
      {item.intensity >= 5 && <div className="fb-hot-bar absolute bottom-0 h-1 w-full" />}
    </div>
  );
}

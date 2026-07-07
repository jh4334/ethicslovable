import { Plus } from "lucide-react";
import type { SiContent } from "../types";
import { buildStories } from "../sns";

/**
 * 스토리 줄 — 청록→보라 그라데이션 링을 두른 동그란 아바타 목록.
 * 첫 칸은 "내 스토리"(+ 배지), 나머지는 콘텐츠 JSON의 카테고리 계정과
 * 누리마을 세계관 캐릭터로 채운다. 전부 장식용(클릭 없음)이다.
 */
export default function StoriesRow({ content }: { content: SiContent }) {
  const stories = buildStories(content);

  return (
    <div className="si-stories flex items-start gap-2 overflow-x-auto border-b bg-card px-3 py-2">
      {/* 내 스토리 */}
      <div className="flex w-[3.25rem] shrink-0 flex-col items-center gap-0.5">
        <span className="relative inline-flex">
          <span className="si-story-ring si-story-ring-plain">
            <span className="si-story-avatar">🧚</span>
          </span>
          <span className="si-story-plus" aria-hidden="true">
            <Plus className="h-2.5 w-2.5" strokeWidth={3.5} />
          </span>
        </span>
        <span className="w-full truncate text-center text-[9px] font-medium text-muted-foreground">
          내 스토리
        </span>
      </div>

      {stories.map((story) => (
        <div
          key={story.name}
          className="flex w-[3.25rem] shrink-0 flex-col items-center gap-0.5"
        >
          <span className="si-story-ring">
            <span className="si-story-avatar">{story.emoji}</span>
          </span>
          <span className="w-full truncate text-center text-[9px] font-medium">
            {story.name}
          </span>
        </div>
      ))}
    </div>
  );
}

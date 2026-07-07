import { Sparkles, Star, Trophy } from "lucide-react";

interface GameHeaderProps {
  /** 화면 상단 제목 (콘텐츠 JSON intro.labName) */
  labName: string;
  /** 플랫폼 워드마크 이름 (intro.platformName) */
  platformName: string;
  level: number;
  totalLevels: number;
  score: number;
}

/**
 * labName 이 "누리TV 알고리즘 연구소"처럼 platformName 으로 시작하면,
 * 워드마크와 겹치지 않게 나머지 부분("알고리즘 연구소")만 떼어 낸다.
 * (표시 전용 파생 — JSON 은 그대로 둔다)
 */
function getLabSuffix(labName: string, platformName: string) {
  return labName.startsWith(platformName) ? labName.slice(platformName.length).trim() : labName;
}

/** 게임 상단 바 — 누리TV 브랜드색(인디고~바이올렛) 그라데이션 + 플랫폼 로고 락업 */
export default function GameHeader({ labName, platformName, level, totalLevels, score }: GameHeaderProps) {
  const labSuffix = getLabSuffix(labName, platformName);

  return (
    <header className="tt-header z-10 flex shrink-0 items-center justify-between p-3 shadow-lg md:p-4">
      {/* 누리TV 로고 락업 — 스파클 심볼 타일 + 워드마크 (가상 플랫폼, 인디고 브랜드) */}
      <h1 className="flex min-w-0 items-center gap-2">
        <span className="tt-logo-mark" aria-hidden>
          <Sparkles size={16} strokeWidth={2.5} />
        </span>
        <span className="tt-wordmark text-lg font-black tracking-tight drop-shadow-sm md:text-xl">
          {platformName}
        </span>
        {labSuffix && (
          <span className="tt-lab-chip hidden shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-bold sm:inline-flex">
            {labSuffix}
          </span>
        )}
      </h1>
      <div className="flex items-center gap-2 md:gap-3">
        {/* 총점 */}
        <div className="tt-header-chip flex items-center gap-1.5 rounded-full px-3.5 py-1.5">
          <Star size={14} className="fill-current text-yellow-300 drop-shadow" aria-hidden />
          <span className="text-sm font-extrabold tabular-nums drop-shadow-sm">{score.toLocaleString()}점</span>
        </div>
        {/* 레벨 */}
        <div className="tt-header-chip flex items-center gap-1.5 rounded-full px-3.5 py-1.5 md:px-4">
          <Trophy size={16} className="text-yellow-300 drop-shadow" aria-hidden />
          <span className="text-sm font-extrabold tabular-nums drop-shadow-sm">
            {level}레벨 / {totalLevels}
          </span>
        </div>
      </div>
    </header>
  );
}

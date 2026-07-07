import { Sparkles, Star, Trophy } from "lucide-react";

interface GameHeaderProps {
  /** 화면 상단 제목 (콘텐츠 JSON intro.labName) */
  labName: string;
  /** 좁은 화면용 짧은 이름 (intro.platformName) */
  platformName: string;
  level: number;
  totalLevels: number;
  score: number;
}

/** 게임 상단 바 — 누리TV 브랜드색(인디고~바이올렛) 그라데이션 */
export default function GameHeader({ labName, platformName, level, totalLevels, score }: GameHeaderProps) {
  return (
    <header className="tt-header z-10 flex shrink-0 items-center justify-between p-3 shadow-lg md:p-4">
      <div className="flex items-center gap-2">
        <Sparkles size={24} className="drop-shadow" aria-hidden />
        <h1 className="hidden text-lg font-extrabold tracking-tight drop-shadow-sm sm:block md:text-xl">{labName}</h1>
        <h1 className="text-lg font-extrabold tracking-tight drop-shadow-sm sm:hidden">{platformName}</h1>
      </div>
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

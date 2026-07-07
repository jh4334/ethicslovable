import { ArrowRight, Sparkles } from "lucide-react";
import { getCategoryMeta } from "./categoryMeta";
import { fakeDuration, fakeViewCount } from "./logic";
import type { Category } from "./types";

interface IntroScreenProps {
  categories: Category[];
  onStart: () => void;
}

/** 미리보기 샘플 카드에 쓰는 고정 아이템 id(동물 분야 "학교 끝나고 달려오는 강아지") */
const SAMPLE_ITEM_ID = 177;

export function IntroScreen({ categories, onStart }: IntroScreenProps) {
  const sampleMeta = getCategoryMeta("ANIMAL");

  return (
    <div className="fb-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="mlq-card w-full max-w-md space-y-6 rounded-3xl p-8 shadow-lift animate-fade-in">
        <div className="mlq-emoji-tile fb-hero-tile fb-bounce mx-auto h-20 w-20">
          <Sparkles size={40} />
        </div>

        <div>
          <h1 className="mb-3 text-3xl font-black leading-tight text-foreground">
            누리피드
            <br />
            성향 분석 실험실
          </h1>
          <p className="text-lg text-muted-foreground">
            매번 공평하게 뜨는 추천 영상 속에서
            <br />내 <strong className="text-foreground">선택이 어디로 쏠리는지</strong> 실험해요
          </p>
        </div>

        {/* 미리보기 — 이런 썸네일 카드를 10번 고르게 된다 (정적 장식) */}
        <div className="fb-sample-card mx-auto w-48" aria-hidden="true">
          <div className={`fb-thumb relative aspect-video w-full overflow-hidden rounded-xl ${sampleMeta.thumbClass}`}>
            <span className="fb-thumb-emoji">{sampleMeta.emoji}</span>
            <span className="fb-play-overlay fb-play-static">
              <span className="fb-play-circle">
                <span className="fb-play-triangle" />
              </span>
            </span>
            <span className="fb-duration absolute bottom-1.5 right-1.5">
              {fakeDuration(SAMPLE_ITEM_ID)}
            </span>
          </div>
          <div className="flex gap-2 pt-2 text-left">
            <span className={`fb-avatar flex-none ${sampleMeta.badgeClass}`}>
              {sampleMeta.channelEmoji}
            </span>
            <div className="min-w-0">
              <div className="fb-clamp-2 text-xs font-bold leading-snug text-card-foreground">
                학교 끝나고 달려오는 강아지
              </div>
              <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                {sampleMeta.channelName} · 조회수 {fakeViewCount(SAMPLE_ITEM_ID)}만회
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 py-1">
          {categories.map((c) => {
            const meta = getCategoryMeta(c.id);
            const Icon = meta.icon;
            return (
              <div
                key={c.id}
                className={`flex flex-col items-center justify-center rounded-xl p-2 opacity-85 transition-all hover:-translate-y-0.5 hover:opacity-100 ${meta.badgeClass}`}
              >
                <Icon size={16} className="mb-1" />
                <span className="text-[10px] font-bold">{c.label}</span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onStart}
          className="fb-btn fb-btn-primary group w-full py-4 text-lg font-bold"
        >
          시작하기
          <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

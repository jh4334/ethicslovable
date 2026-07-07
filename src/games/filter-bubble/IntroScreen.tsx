import { ArrowRight, Sparkles } from "lucide-react";
import { getCategoryMeta } from "./categoryMeta";
import type { Category } from "./types";

interface IntroScreenProps {
  categories: Category[];
  onStart: () => void;
}

export function IntroScreen({ categories, onStart }: IntroScreenProps) {
  return (
    <div className="fb-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="mlq-card w-full max-w-md space-y-8 rounded-3xl p-8 shadow-lift animate-fade-in">
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
            매번 공평하게 주어지는 카드 속에서
            <br />내 <strong className="text-foreground">선택이 어디로 쏠리는지</strong> 실험해요
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 py-4">
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

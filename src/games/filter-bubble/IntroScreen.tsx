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
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-card p-8 shadow-xl animate-fade-in">
        <div className="fb-bounce mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl">
          <Sparkles size={40} />
        </div>

        <div>
          <h1 className="mb-3 text-3xl font-black leading-tight text-foreground">
            알고리즘
            <br />
            성향 테스트
          </h1>
          <p className="text-lg text-muted-foreground">
            매번 공평하게 주어지는 정보 속에서
            <br />내 <strong className="text-foreground">선택이 어디로 쏠리는지</strong> 알아봐요
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 py-4">
          {categories.map((c) => {
            const meta = getCategoryMeta(c.id);
            const Icon = meta.icon;
            return (
              <div
                key={c.id}
                className={`flex flex-col items-center justify-center rounded-lg p-2 opacity-80 transition-opacity hover:opacity-100 ${meta.badgeClass}`}
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

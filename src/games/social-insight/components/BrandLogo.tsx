import { cn } from "@/lib/utils";

/**
 * 가상 SNS "반짝피드"의 자체 로고 마크.
 * 청록→보라 그라데이션의 둥근 사각형 안에 네 갈래 반짝임(✨) 별 —
 * 실제 어떤 SNS 상표와도 닮지 않게 직접 그린 도형이다.
 */
export default function BrandLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-6 w-6", className)}
      role="img"
      aria-label="반짝피드 로고"
    >
      <defs>
        <linearGradient id="si-brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(174 62% 42%)" />
          <stop offset="100%" stopColor="hsl(258 82% 62%)" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="url(#si-brand-gradient)" />
      {/* 큰 반짝임 */}
      <path
        d="M11.4 5.6 L12.9 10.5 L17.8 12 L12.9 13.5 L11.4 18.4 L9.9 13.5 L5 12 L9.9 10.5 Z"
        fill="#fff"
      />
      {/* 작은 반짝임 */}
      <path d="M17.6 5.2 L18.2 6.9 L19.9 7.5 L18.2 8.1 L17.6 9.8 L17 8.1 L15.3 7.5 L17 6.9 Z" fill="#fff" opacity="0.85" />
    </svg>
  );
}

import type { ReactNode } from "react";
import { Battery, Heart, Send, Signal, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import BrandLogo from "./BrandLogo";

/**
 * 스마트폰 프레임 3종 세트.
 * 특정 기기·특정 앱을 흉내 내지 않는 일반적인 UI 패턴만 사용한다:
 * 둥근 베젤, 상태 표시줄(시계 대신 "누리마을"), 앱 상단 바(로고 + 알림/쪽지 아이콘).
 */

/** 상태 표시줄 — 장식용. 실제 시계 대신 마을 이름을 보여 준다. */
export function PhoneStatusBar() {
  return (
    <div className="si-status-bar flex items-center justify-between bg-card px-4 pb-0.5 pt-1.5 text-[10px] font-bold text-muted-foreground">
      <span>누리마을</span>
      <span className="flex items-center gap-1" aria-hidden="true">
        <Signal className="h-3 w-3" />
        <Wifi className="h-3 w-3" />
        <Battery className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}

/** 누리피드 앱 상단 바 — 왼쪽 로고+워드마크, 오른쪽 알림(하트)·쪽지(종이비행기) */
export function AppTopBar({ snsName }: { snsName: string }) {
  return (
    <div className="flex items-center justify-between border-b bg-card px-3 py-2">
      <div className="flex items-center gap-1.5">
        <BrandLogo className="h-5 w-5" />
        <span className="si-brand-text text-sm font-extrabold">{snsName}</span>
      </div>
      <div className="flex items-center gap-3.5 text-foreground" aria-hidden="true">
        <span className="relative inline-flex">
          <Heart className="h-5 w-5" strokeWidth={1.9} />
          <span className="si-noti-dot" />
        </span>
        <Send className="h-5 w-5" strokeWidth={1.9} />
      </div>
    </div>
  );
}

/** 둥근 베젤의 스마트폰 프레임 — 작은 화면에서는 베젤이 사라지고 전체 폭이 된다 */
export default function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("si-phone w-full", className)}>
      <div className="si-phone-screen">{children}</div>
    </div>
  );
}

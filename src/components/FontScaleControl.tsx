import { useEffect, useRef, useState } from "react";
import { Type, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFontScale, setFontScale, type FontScale } from "@/lib/prefs";

/**
 * 글자 크기 조절 — 화면 오른쪽 아래 고정 버튼.
 * 저학년·저시력 학생이 스스로 글자를 키울 수 있게 한다(UDL).
 * <html> 기준 크기를 바꾸므로 앱 전체 글자·간격이 함께 커진다.
 * 인쇄 시에는 숨긴다(수료증 등 인쇄물 오염 방지).
 */
const OPTIONS: { id: FontScale; label: string; sample: string }[] = [
  { id: "normal", label: "보통", sample: "가" },
  { id: "large", label: "크게", sample: "가" },
  { id: "xlarge", label: "아주 크게", sample: "가" },
];

export default function FontScaleControl() {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState<FontScale>(getFontScale);
  const panelRef = useRef<HTMLDivElement>(null);

  const choose = (s: FontScale) => {
    setScale(s);
    setFontScale(s);
  };

  // 바깥 클릭·ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={panelRef}
      className="cert-noprint fixed bottom-3 right-3 z-50 flex flex-col items-end gap-2"
    >
      {open && (
        <div className="mlq-card animate-scale-in flex flex-col gap-1.5 p-2.5 shadow-lift">
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-xs font-bold text-muted-foreground">글자 크기</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="닫기"
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => choose(o.id)}
              aria-pressed={scale === o.id}
              className={cn(
                "flex min-h-[44px] items-center justify-between gap-3 rounded-xl border-2 px-3 py-1.5 text-left transition-colors",
                scale === o.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              <span className="text-sm font-bold">{o.label}</span>
              <span
                aria-hidden
                className={cn(
                  "font-black",
                  o.id === "normal" && "text-base",
                  o.id === "large" && "text-lg",
                  o.id === "xlarge" && "text-2xl",
                )}
              >
                {o.sample}
              </span>
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="글자 크기 조절"
        aria-expanded={open}
        className="mlq-btn-primary flex h-12 w-12 items-center justify-center rounded-full shadow-lift"
      >
        <Type className="h-5 w-5" />
      </button>
    </div>
  );
}

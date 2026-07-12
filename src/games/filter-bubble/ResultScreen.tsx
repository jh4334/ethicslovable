import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Check, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { markCompleted } from "@/lib/progress";
import { getCategoryMeta } from "./categoryMeta";
import { computeRiskScore } from "./logic";
import { FilterBubbleGauge } from "./FilterBubbleGauge";
import { TendencyTable } from "./TendencyTable";
import type { FilterBubbleContent, ContentItem, Persona } from "./types";

interface ResultScreenProps {
  history: ContentItem[];
  persona: Persona;
  content: FilterBubbleContent;
  onRestart: () => void;
}

export function ResultScreen({ history, persona, content, onRestart }: ResultScreenProps) {
  const meta = getCategoryMeta(persona.type);
  const TypeIcon = meta.icon;
  const captureRef = useRef<HTMLDivElement>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const riskScore = computeRiskScore(history, content.categories.length);

  // 결과 화면 도착 = 게임 완료 기록 (StrictMode 이중 실행 대비 ref 가드)
  const markedRef = useRef(false);
  useEffect(() => {
    if (markedRef.current) return;
    markedRef.current = true;
    markCompleted("filter-bubble", `필터버블 위험도 ${riskScore}점 · ${persona.title}`);
  }, [riskScore, persona.title]);

  const handleShare = async () => {
    if (!captureRef.current || isCopying) return;

    setIsCopying(true);
    setCopied(false);

    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#f4f5f7",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("이미지를 만들지 못했어요.");
          setIsCopying(false);
          return;
        }

        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopied(true);
          toast.success("클립보드에 복사했어요! 붙여넣기(Ctrl+V) 해 보세요.");

          setTimeout(() => setCopied(false), 3000);
        } catch {
          // 클립보드가 안 되면 파일로 내려받기
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "필터버블-탐지기-결과.png";
          a.click();
          URL.revokeObjectURL(url);
          toast.success("결과 이미지를 내려받았어요!");
        }

        setIsCopying(false);
      }, "image/png");
    } catch {
      toast.error("화면을 저장하지 못했어요.");
      setIsCopying(false);
    }
  };

  return (
    <div className="fb-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 animate-fade-in">
        {/* 이미지로 저장되는 영역 */}
        <div ref={captureRef} className="-m-4 space-y-4 p-4">
          {/* 성향 카드 */}
          <div className="mlq-card overflow-hidden rounded-3xl shadow-lift">
            <div className={`relative overflow-hidden p-8 text-center ${meta.bgClass}`}>
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-card shadow-lg ${meta.textClass}`}
                >
                  <TypeIcon size={40} />
                </div>
                <div className="mlq-chip mb-2 bg-card/70 tracking-wider text-card-foreground backdrop-blur-sm">
                  나의 알고리즘 성향
                </div>
                <h2 className="mlq-gradient-text mb-1 text-3xl font-black">{persona.title}</h2>
              </div>
            </div>
            <div className="p-6 text-center text-sm font-medium leading-relaxed text-muted-foreground">
              {persona.description}
            </div>
          </div>

          {/* 분석 영역 */}
          <FilterBubbleGauge riskScore={riskScore} levels={content.gaugeLevels} />
          <TendencyTable history={history} categories={content.categories} />
        </div>

        {/* 학습지 연계 안내 */}
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          📄 {content.ui.worksheetNote}
        </p>

        {/* 동작 버튼 */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleShare}
            disabled={isCopying}
            className="fb-btn fb-btn-outline w-full py-4 font-bold"
          >
            {copied ? (
              <>
                <Check size={18} className="fb-text-safe" />
                복사 완료! 붙여넣기(Ctrl+V) 해 보세요
              </>
            ) : isCopying ? (
              <>
                <span className="fb-spinner" aria-hidden="true" />
                이미지를 만드는 중이에요...
              </>
            ) : (
              <>
                <Share2 size={18} />
                결과 공유하기
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="fb-btn fb-btn-primary w-full py-4 font-bold"
          >
            <RefreshCw size={18} />
            다시 테스트하기
          </button>
        </div>
      </div>
    </div>
  );
}

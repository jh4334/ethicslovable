import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle, Lightbulb, MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MissionCheckResult, MissionContent } from "./types";

interface MissionCardProps {
  mission: MissionContent;
  status: MissionCheckResult;
  /** 이번 레벨에서 슬라이더를 한 번이라도 움직였는가 (즉시 클리어 방지) */
  hasMoved: boolean;
  isLastLevel: boolean;
  onNextLevel: () => void;
}

/** 왼쪽 패널 상단의 미션 카드 — 다섯 레벨 모두 실시간 진행 상황을 보여 준다 */
export default function MissionCard({ mission, status, hasMoved, isLastLevel, onNextLevel }: MissionCardProps) {
  const canAdvance = status.complete && hasMoved;

  return (
    <motion.div
      key={mission.id}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border-b-4 p-5 transition-colors duration-300",
        status.complete ? "border-success bg-success/10" : "border-warning bg-warning/10"
      )}
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          {status.complete ? (
            <CheckCircle className="shrink-0 text-success" aria-hidden />
          ) : (
            <AlertCircle className="shrink-0 text-warning" aria-hidden />
          )}
          {mission.title}
        </h3>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{mission.description}</p>

      {/* 힌트 */}
      <div className="mb-3 flex items-start gap-2 rounded-lg bg-accent/25 p-2.5 text-xs text-accent-foreground">
        <Lightbulb size={14} className="mt-0.5 shrink-0" aria-hidden />
        <span>{mission.hint}</span>
      </div>

      {/* 실시간 진행 상황 (모든 레벨) */}
      <div className="mb-4 rounded-lg border border-border bg-card/60 p-3">
        <div className="text-xs font-semibold text-foreground">{status.summary}</div>
        {status.details && (
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {status.details.map((line, idx) => (
              <li key={idx} className="truncate">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canAdvance ? (
        <motion.button
          onClick={onNextLevel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-success px-4 py-2.5 font-bold text-success-foreground shadow-lg transition-all"
        >
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="flex items-center gap-2"
          >
            {isLastLevel ? "최종 결과 보기" : "다음 레벨로 이동"} <ArrowRight size={18} aria-hidden />
          </motion.span>
        </motion.button>
      ) : status.complete ? (
        /* 기본 가중치만으로 조건이 이미 맞을 때 — 슬라이더를 움직여야 넘어갈 수 있다 */
        <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-center text-sm font-bold text-secondary-foreground">
          <MoveHorizontal size={16} aria-hidden /> 먼저 슬라이더를 움직여 알고리즘을 조정해 보세요!
        </div>
      ) : (
        <div className="w-full rounded-lg bg-secondary px-4 py-2.5 text-center text-sm font-bold text-muted-foreground">
          미션 조건을 달성하면 버튼이 열려요
        </div>
      )}
    </motion.div>
  );
}

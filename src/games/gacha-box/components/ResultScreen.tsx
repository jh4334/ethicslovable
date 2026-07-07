/**
 * 결과 · 조사 보고서 — 쓴 코인, 얻은 아이템, 퀴즈 결과, 지킴이 등급을
 * 정리하고 학습 완료를 기록한다. (markCompleted는 ref 가드로 1회만)
 *
 * 지킴이 등급 점수(최대 6점):
 *   확률 퀴즈 정답 +2 · 시나리오 선택 +1 · 체크리스트 체크 1개당 +1(최대 3)
 */
import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { markCompleted } from "@/lib/progress";
import type { GbContent, GbGrade } from "../types";
import type { GachaGame } from "../useGachaGame";
import { formatCoins, legendaryOf } from "../format";

interface ResultScreenProps {
  content: GbContent;
  game: GachaGame;
}

function pickGrade(grades: GbGrade[], score: number): GbGrade {
  const sorted = [...grades].sort((a, b) => b.min - a.min);
  return sorted.find((g) => score >= g.min) ?? sorted[sorted.length - 1];
}

export default function ResultScreen({ content, game }: ResultScreenProps) {
  const { result } = content;
  const checkedCount = game.checked.filter(Boolean).length;
  const score = (game.quizCorrect ? 2 : 0) + (game.scenarioChoice !== null ? 1 : 0) + checkedCount;
  const grade = pickGrade(content.grades, score);

  const legendary = legendaryOf(content);
  const gotLegendary = game.pulls.some((p) => p.rarityKey === legendary.key);

  const rarityByKey = useMemo(() => {
    const map = new Map(content.rarities.map((r) => [r.key, r] as const));
    return map;
  }, [content.rarities]);

  // 학습 완료 기록 — StrictMode 이중 실행에도 한 번만 저장한다
  const savedRef = useRef(false);
  const pullCount = game.pulls.length;
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    markCompleted("gacha-box", `${pullCount}회 뽑기 조사 · 전설 확률의 비밀 해부`);
  }, [pullCount]);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <h1 className="text-xl font-black">{result.title}</h1>
      </motion.div>

      {/* 지킴이 등급 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="gb-callout mt-4 rounded-2xl p-5 text-center"
      >
        <div className="text-4xl" aria-hidden>
          {grade.emoji}
        </div>
        <div className="gb-grad-text mt-1.5 text-lg font-black">{grade.label}</div>
        <p className="mt-1.5 text-xs font-bold leading-relaxed text-foreground/80">{grade.comment}</p>
      </motion.div>

      {/* 조사 요약 통계 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mt-4 grid grid-cols-2 gap-2"
      >
        <div className="mlq-card p-3 text-center">
          <div className="text-[11px] font-bold text-muted-foreground">{result.spentLabel}</div>
          <div className="mt-0.5 text-lg font-black tabular-nums">💰 {formatCoins(game.spentCoins)}</div>
        </div>
        <div className="mlq-card p-3 text-center">
          <div className="text-[11px] font-bold text-muted-foreground">{result.pullsLabel}</div>
          <div className="mt-0.5 text-lg font-black tabular-nums">🎁 {game.pulls.length}회</div>
        </div>
        <div className="mlq-card p-3 text-center">
          <div className="text-[11px] font-bold text-muted-foreground">{result.nearMissLabel}</div>
          <div className="mt-0.5 text-lg font-black tabular-nums">😫 {game.nearMissCount}번</div>
        </div>
        <div className="mlq-card p-3 text-center">
          <div className="text-[11px] font-bold text-muted-foreground">{result.quizLabel}</div>
          <div className="mt-0.5 text-lg font-black">
            {game.quizCorrect ? `⭕ ${result.quizPass}` : `❌ ${result.quizFail}`}
          </div>
        </div>
      </motion.div>

      {/* 얻은 아이템 인벤토리 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mlq-card mt-3 p-4"
      >
        <h2 className="text-xs font-extrabold">{result.inventoryTitle}</h2>
        {game.pulls.length > 0 ? (
          <div className="mt-2.5 grid grid-cols-5 gap-1.5">
            {game.pulls.map((pull) => {
              const rarity = rarityByKey.get(pull.rarityKey);
              return (
                <div
                  key={pull.index}
                  title={`${rarity?.label ?? ""} · ${pull.item.name}`}
                  className="flex aspect-square items-center justify-center rounded-xl border-2 text-2xl"
                  style={{
                    borderColor: rarity?.color ?? "#ccc",
                    background: `${rarity?.color ?? "#cccccc"}12`,
                  }}
                >
                  <span aria-hidden>{pull.item.emoji}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-[11px] font-semibold text-muted-foreground">-</p>
        )}
        <p className="mt-3 border-t pt-2.5 text-xs font-bold leading-relaxed text-foreground/80">
          {gotLegendary ? result.legendaryNote : result.noLegendaryNote}
        </p>
      </motion.div>

      {/* 진짜 돈 경고 + 완료 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="mt-3 rounded-2xl border-2 border-warning/50 bg-warning/10 p-3.5 text-xs font-bold leading-relaxed">
          ⚠️ {result.realMoneyNote}
        </div>
        <p className="mt-3 text-center text-[11px] font-semibold text-muted-foreground">
          ✅ {result.finishNote}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Link to="/" className="gb-btn w-full px-6 py-3 text-center text-sm">
            {result.mapButton}
          </Link>
          <button
            type="button"
            onClick={game.restart}
            className="w-full rounded-xl border bg-card px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            {result.restartButton}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

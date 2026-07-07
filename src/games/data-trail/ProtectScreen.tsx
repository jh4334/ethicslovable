/**
 * 파트 C — 내 데이터 지키기.
 * 4가지 상황에서 선택 → 즉시 피드백. 좋은 선택마다 데이터 방패 1개 획득(0~4개).
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DtContent } from "./types";
import type { DataTrailGame } from "./useDataTrailGame";

interface ProtectScreenProps {
  content: DtContent;
  game: DataTrailGame;
}

export default function ProtectScreen({ content, game }: ProtectScreenProps) {
  const { protect } = content;
  const { finishProtect } = game;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [earned, setEarned] = useState(0);

  const scenario = protect.scenarios[index];
  const isLast = index >= protect.scenarios.length - 1;
  const answered = selected !== null;

  const handleChoice = (choiceIndex: number) => {
    if (answered) return;
    setSelected(choiceIndex);
    if (scenario.choices[choiceIndex].isGood) {
      setEarned((n) => n + 1);
    }
  };

  const handleNext = () => {
    if (isLast) {
      finishProtect(earned);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  return (
    <div className="dt-screen">
      <div className="container max-w-xl py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">🛡️ {protect.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{protect.subtitle}</p>
          </div>
          <span
            key={earned}
            className="dt-shield dt-counter-pop inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold"
          >
            <Shield className="h-4 w-4" />
            {protect.shieldLabel} {earned}개
          </span>
        </div>

        <p className="mt-4 text-xs font-semibold text-muted-foreground">
          상황 {index + 1} / {protect.scenarios.length}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="mlq-card mt-2 p-5"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{scenario.emoji}</span>
              <p className="text-sm font-bold leading-relaxed">{scenario.situation}</p>
            </div>

            <div className="mt-4 space-y-2">
              {scenario.choices.map((choice, i) => {
                const isPicked = selected === i;
                return (
                  <div key={i}>
                    <button
                      type="button"
                      disabled={answered}
                      onClick={() => handleChoice(i)}
                      className={cn(
                        "dt-choice w-full rounded-xl px-4 py-2.5 text-left text-sm",
                        answered && isPicked && (choice.isGood ? "dt-choice-good" : "dt-choice-bad"),
                        answered && !isPicked && "dt-choice-dim",
                      )}
                    >
                      {choice.text}
                      {answered && isPicked && (choice.isGood ? " ✅" : " ❌")}
                    </button>
                    {answered && isPicked && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "mt-1.5 rounded-lg px-3 py-2 text-xs font-semibold leading-relaxed",
                          choice.isGood ? "dt-shield" : "dt-ad-reason-bait",
                        )}
                      >
                        {choice.isGood ? "🛡️ " : "💬 "}
                        {choice.feedback}
                      </motion.p>
                    )}
                  </div>
                );
              })}
            </div>

            {answered && (
              <button
                type="button"
                onClick={handleNext}
                className="dt-btn dt-btn-primary mt-4 w-full px-5 py-2.5 text-sm"
              >
                {isLast ? protect.finishButton : protect.nextButton} →
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

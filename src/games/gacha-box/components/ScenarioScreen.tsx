/**
 * 4단계 · 현명한 선택 시나리오 — "확정 판매 9,000코인도 있었다면?"
 * 정답이 없는 선택 문제. 어떤 선택이든 '계산하고 비교한 뒤 정하기'가
 * 핵심이라는 걸 피드백으로 짚고, 뽑기 전 체크리스트로 마무리한다.
 */
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GbContent } from "../types";
import type { GachaGame } from "../useGachaGame";
import { formatCoins } from "../format";

interface ScenarioScreenProps {
  content: GbContent;
  game: GachaGame;
}

export default function ScenarioScreen({ content, game }: ScenarioScreenProps) {
  const { scenario, checklist, shop } = content;
  const chosen = game.scenarioChoice;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 pb-10">
      <div className="text-center">
        <span className="gb-pill text-[11px]">4단계 · 현명한 선택</span>
        <h1 className="mt-3 text-xl font-black">🤔 {scenario.title}</h1>
      </div>

      {/* 시나리오 — 확정 판매 상품 공개 */}
      <div className="mlq-card mt-4 p-4">
        <div className="flex items-center gap-3 rounded-xl border-2 border-warning/50 bg-warning/10 p-3">
          <span className="text-3xl" aria-hidden>
            {shop.itemEmoji}
          </span>
          <div>
            <p className="text-sm font-black">{shop.itemName}</p>
            <p className="text-xs font-extrabold text-warning">
              🏷️ 확정 판매 {formatCoins(shop.directPrice)}코인
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold leading-relaxed">{scenario.question}</p>
        <p className="mt-2 text-[11px] font-semibold text-muted-foreground">{scenario.note}</p>
      </div>

      {/* 선택지 3개 — 정답 없음, 각자의 생각거리 피드백 */}
      <div className="mt-4 space-y-2.5">
        {scenario.choices.map((choice, i) => {
          const isPicked = chosen === i;
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => game.chooseScenario(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 bg-card px-4 py-3 text-left text-sm font-extrabold transition-all",
                  isPicked
                    ? "border-warning bg-warning/10 shadow-soft"
                    : "border-border hover:-translate-y-0.5 hover:border-warning/60",
                  chosen !== null && !isPicked && "opacity-55",
                )}
              >
                <span className="text-xl" aria-hidden>
                  {choice.emoji}
                </span>
                {choice.label}
              </button>
              <AnimatePresence>
                {isPicked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="gb-callout mt-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold leading-relaxed">
                      💬 {choice.feedback}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* 뽑기 전 체크리스트 — 선택을 마치면 등장 */}
      <AnimatePresence>
        {chosen !== null && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mlq-card mt-5 p-4"
          >
            <h2 className="text-sm font-black">{checklist.title}</h2>
            <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{checklist.intro}</p>
            <div className="mt-3 space-y-2">
              {checklist.items.map((item, i) => {
                const isChecked = game.checked[i];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => game.toggleCheck(i)}
                    aria-pressed={isChecked}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-xl border-2 px-3.5 py-2.5 text-left text-xs font-bold leading-relaxed transition-all",
                      isChecked
                        ? "border-success bg-success/10 text-foreground"
                        : "border-border bg-card hover:border-success/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[10px] font-black",
                        isChecked ? "border-success bg-success text-white" : "border-muted-foreground/40",
                      )}
                      aria-hidden
                    >
                      {isChecked ? "✓" : ""}
                    </span>
                    {item}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={game.goResult}
        disabled={chosen === null}
        className="gb-btn mt-5 w-full px-6 py-3.5 text-base"
      >
        📋 {checklist.nextButton}
      </button>
      {chosen === null && (
        <p className="mt-2 text-center text-[11px] font-semibold text-muted-foreground">
          선택지를 하나 고르면 조사 보고서를 볼 수 있어요.
        </p>
      )}
    </div>
  );
}

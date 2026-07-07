/**
 * 3단계 · 상술 해부 — 방금 상점에서 직접 겪은 3가지 장치를
 * 한 장씩 해부한다. 각 카드에는 내 실제 조사 데이터(아쉬움 연출 횟수,
 * 쓴 코인 등)가 채워져서 "남 얘기"가 아니라 "내가 겪은 일"이 된다.
 */
import { useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import type { GbContent } from "../types";
import type { GachaGame } from "../useGachaGame";
import { buildVars, fillTemplate } from "../format";

interface TricksScreenProps {
  content: GbContent;
  game: GachaGame;
}

export default function TricksScreen({ content, game }: TricksScreenProps) {
  const { tricks } = content;
  const [opened, setOpened] = useState(1); // 첫 카드는 바로 보여 준다
  const total = tricks.cards.length;
  const allOpened = opened >= total;

  const vars = buildVars(content, {
    pulls: game.pulls.length,
    spentCoins: game.spentCoins,
    nearMissCount: game.nearMissCount,
  });

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center px-4 py-8">
      <div className="text-center">
        <span className="gb-pill text-[11px]">3단계 · 상술 해부</span>
        <h1 className="mt-3 text-xl font-black">🔧 {tricks.title}</h1>
        <p className="mt-1.5 text-xs font-bold leading-relaxed text-muted-foreground">{tricks.intro}</p>
      </div>

      {/* 진행 점 */}
      <div className="mt-4 flex justify-center gap-1.5">
        {tricks.cards.map((_, i) => (
          <div
            key={i}
            className={i < opened ? "h-2 w-8 rounded-full bg-warning" : "h-2 w-8 rounded-full bg-muted"}
          />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {tricks.cards.slice(0, opened).map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mlq-card p-4"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="mlq-emoji-tile h-10 w-10 shrink-0 text-xl"
                style={{ "--tile-hue": 45 } as CSSProperties}
                aria-hidden
              >
                {card.emoji}
              </span>
              <h2 className="text-sm font-black">{card.title}</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-foreground/90">{card.text}</p>
            {/* 내 실제 조사 데이터 연결 */}
            <p className="gb-callout mt-2.5 rounded-xl px-3 py-2 text-xs font-extrabold leading-relaxed">
              📋 {fillTemplate(card.dataLine, vars)}
            </p>
          </motion.div>
        ))}
      </div>

      {!allOpened ? (
        <button
          type="button"
          onClick={() => setOpened((n) => Math.min(n + 1, total))}
          className="gb-btn mt-5 w-full px-6 py-3 text-sm"
        >
          {tricks.revealButton} ({opened}/{total})
        </button>
      ) : (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          type="button"
          onClick={game.goScenario}
          className="gb-btn mt-5 w-full px-6 py-3.5 text-base"
        >
          🤔 {tricks.nextButton}
        </motion.button>
      )}
    </div>
  );
}

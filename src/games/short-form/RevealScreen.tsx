/**
 * 설계 해부 화면 — 방금 겪은 3가지 설계를 카드로 공개한다.
 * ① 무한 피드 ② 뽑기식(가변) 보상 ③ 시계 없음 + 작은 멈춤 버튼.
 * 각 카드에 '내가 겪은 장면'(내 스와이프 수·대박 영상 수·퀴즈 오차·멈추기 결과)을 연결한다.
 */
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { fill } from "./logic";
import type { SfContent, SfRevealCard } from "./types";
import type { ShortFormGame } from "./useShortFormGame";

interface RevealScreenProps {
  content: SfContent;
  game: ShortFormGame;
}

export default function RevealScreen({ content, game }: RevealScreenProps) {
  const { designReveal, stopChallenge } = content;
  const { stats, outcome, goResult } = game;

  const myDataFor = (card: SfRevealCard): string => {
    if (card.id === "infinite") return fill(card.myDataTemplate, { 영상수: stats.watched });
    if (card.id === "variable") return fill(card.myDataTemplate, { 대박수: stats.jackpotSeen });
    return fill(card.myDataTemplate, {
      오차: stats.totalErrorMin,
      멈춤결과: stopChallenge.outcomeShort[outcome ?? "forced"],
    });
  };

  return (
    <div className="sf-screen py-8">
      <div className="container max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="sf-accent-text text-sm font-bold">누리마을 지킴이 · 조사 결과</p>
          <h2 className="mt-1 text-2xl font-extrabold">🔍 {designReveal.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{designReveal.subtitle}</p>
        </motion.div>

        <div className="mt-6 space-y-4">
          {designReveal.cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.18 }}
              className="sf-reveal-card mlq-card p-5"
            >
              <div className="flex items-start gap-3">
                <span className="mlq-emoji-tile sf-reveal-tile h-12 w-12 shrink-0 text-2xl">
                  {card.emoji}
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold leading-snug">{card.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {card.body}
                  </p>
                </div>
              </div>
              {/* 내가 겪은 장면 — 내 데이터와 설계를 연결 */}
              <div className="sf-mydata mt-3 rounded-xl px-3.5 py-2.5">
                <p className="text-[11px] font-black uppercase tracking-wide">
                  📌 {designReveal.myDataLabel}
                </p>
                <p className="mt-1 text-sm font-bold leading-relaxed">{myDataFor(card)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          type="button"
          onClick={goResult}
          className="sf-btn sf-btn-primary mt-6 w-full px-6 py-3 text-base"
        >
          <FileText className="h-4 w-4" />
          {designReveal.nextButton}
        </motion.button>
      </div>
    </div>
  );
}

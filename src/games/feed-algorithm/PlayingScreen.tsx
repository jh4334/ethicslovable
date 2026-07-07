import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StatBar from "./StatBar";
import GameCard from "./GameCard";
import DragTutorial from "./DragTutorial";
import { applyEffects, checkGameOver, makeInitialStats } from "./logic";
import type {
  EndingInfo,
  FeedAlgorithmContent,
  GameLogEntry,
  StatKey,
  Stats,
} from "./types";

const TUTORIAL_KEY = "mlq-feed-algorithm-tutorial-seen";

const BAR_COLOR: Record<StatKey, string> = {
  eng: "fa-bar-eng",
  safe: "fa-bar-safe",
  profit: "fa-bar-profit",
  trust: "fa-bar-trust",
};

const NO_PREVIEW: Stats = { eng: 0, safe: 0, profit: 0, trust: 0 };

interface PlayingScreenProps {
  content: FeedAlgorithmContent;
  onGameOver: (ending: EndingInfo, day: number, log: GameLogEntry[], stats: Stats) => void;
  onSuccess: (day: number, log: GameLogEntry[], stats: Stats) => void;
}

const PlayingScreen = ({ content, onGameOver, onSuccess }: PlayingScreenProps) => {
  const { cards, meta } = content;

  const [stats, setStats] = useState<Stats>(() => makeInitialStats(meta.startValue));
  const [day, setDay] = useState(1);
  const [cardIndex, setCardIndex] = useState(() => Math.floor(Math.random() * cards.length));
  const [preview, setPreview] = useState<Stats>(NO_PREVIEW);
  const [isAnimating, setIsAnimating] = useState(false);
  const [notification, setNotification] = useState("");
  const [log, setLog] = useState<GameLogEntry[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const timerRef = useRef<number | null>(null);

  // 처음 플레이하는 학생에게만 드래그 안내를 보여준다.
  useEffect(() => {
    try {
      if (!localStorage.getItem(TUTORIAL_KEY)) setShowTutorial(true);
    } catch {
      setShowTutorial(true);
    }
  }, []);

  // 화면을 떠날 때 예약된 타이머를 정리한다.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const dismissTutorial = () => {
    setShowTutorial(false);
    try {
      localStorage.setItem(TUTORIAL_KEY, "true");
    } catch {
      /* 저장 실패해도 게임은 계속 */
    }
  };

  const card = cards[cardIndex];

  const handleDecision = useCallback(
    (direction: "YES" | "NO") => {
      if (isAnimating) return;
      setIsAnimating(true);

      const choice = direction === "YES" ? card.approve : card.reject;

      // 다음 상태를 먼저 순수하게 계산한다(StrictMode 안전).
      const nextStats = applyEffects(stats, choice.effects);
      const newLog: GameLogEntry[] = [
        ...log,
        { day, concept: card.concept, msg: choice.message, type: direction },
      ];
      const ending = checkGameOver(nextStats, content.gameOverEndings);

      setStats(nextStats);
      setLog(newLog);
      setNotification(choice.message);
      setPreview(NO_PREVIEW);

      // 결과 메시지를 잠시 보여준 뒤 다음 단계로 넘어간다.
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        if (ending) {
          onGameOver(
            { emoji: ending.emoji, title: ending.title, desc: ending.desc, survived: false },
            day,
            newLog,
            nextStats,
          );
          return;
        }

        const nextDay = day + 1;
        if (nextDay > meta.maxDays) {
          onSuccess(day, newLog, nextStats);
          return;
        }

        setNotification("");
        let nextIdx: number;
        do {
          nextIdx = Math.floor(Math.random() * cards.length);
        } while (nextIdx === cardIndex && cards.length > 1);
        setCardIndex(nextIdx);
        setDay(nextDay);
        setIsAnimating(false);
      }, 1500);
    },
    [card, cardIndex, cards.length, content.gameOverEndings, day, isAnimating, log, meta.maxDays, onGameOver, onSuccess, stats],
  );

  const handleDragUpdate = useCallback(
    (direction: "YES" | "NO" | null) => {
      if (direction === "YES") {
        setPreview(card.approve.effects);
      } else if (direction === "NO") {
        setPreview(card.reject.effects);
      } else {
        setPreview(NO_PREVIEW);
      }
    },
    [card],
  );

  return (
    <div className="flex h-full w-full flex-col">
      {/* 상단 수치판 */}
      <div className="fa-panel z-10 m-2 grid grid-cols-2 gap-x-6 gap-y-1 px-4 py-3">
        {content.stats.map((stat) => (
          <StatBar
            key={stat.key}
            value={stats[stat.key]}
            label={stat.label}
            icon={stat.icon}
            colorClass={BAR_COLOR[stat.key]}
            showChange={preview[stat.key]}
          />
        ))}
      </div>

      {/* 진행 표시 */}
      <div className="fa-dim py-1 text-center text-xs font-bold">
        {day}일차 / {meta.maxDays}일
      </div>

      {/* 카드 영역 */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden pb-10">
        <AnimatePresence>
          {showTutorial && <DragTutorial tutorial={content.tutorial} onDismiss={dismissTutorial} />}
        </AnimatePresence>

        {/* 선택 결과 알림 */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fa-toast absolute inset-x-4 top-4 z-40 p-4 text-center"
              role="status"
            >
              <span className="mr-2 text-2xl" aria-hidden="true">
                📢
              </span>
              <span className="text-sm font-bold">{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${day}-${cardIndex}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex w-full items-center justify-center px-4"
          >
            <GameCard card={card} onDecision={handleDecision} onDragUpdate={handleDragUpdate} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fa-dim flex h-10 items-center justify-center border-t border-white/10 text-xs">
        카드를 좌우로 드래그해서 선택해요
      </div>
    </div>
  );
};

export default PlayingScreen;

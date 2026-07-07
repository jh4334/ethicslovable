import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import type { DilemmaCard } from "./types";

interface GameCardProps {
  card: DilemmaCard;
  onDecision: (direction: "YES" | "NO") => void;
  onDragUpdate: (direction: "YES" | "NO" | null) => void;
}

/** 좌우로 드래그해서 승인/거절을 고르는 딜레마 카드 */
const GameCard = ({ card, onDecision, onDragUpdate }: GameCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const yesOpacity = useTransform(x, [0, 100], [0, 1]);
  const noOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDrag = (_: unknown, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      onDragUpdate("YES");
    } else if (info.offset.x < -threshold) {
      onDragUpdate("NO");
    } else {
      onDragUpdate(null);
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onDecision("YES");
    } else if (info.offset.x < -threshold) {
      onDecision("NO");
    }
    onDragUpdate(null);
  };

  return (
    <div className="relative mx-auto w-[300px] pb-4">
      {/* 뒤에 겹쳐 보이는 카드 더미 */}
      <div className="fa-card-ghost inset-x-2 top-2 bottom-0 translate-y-4 opacity-60" />
      <div className="fa-card-ghost inset-x-4 top-4 bottom-0 translate-y-6 opacity-30" />

      {/* 실제 카드 */}
      <motion.div
        className="fa-card z-20 flex flex-col items-center overflow-visible"
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        aria-label={`${card.concept} 딜레마 카드. 오른쪽으로 밀면 승인, 왼쪽으로 밀면 거절이에요.`}
      >
        <div className="fa-card-shine" />

        {/* 승인 도장 */}
        <motion.div className="fa-stamp fa-stamp-yes" style={{ opacity: yesOpacity }}>
          승인 👍
        </motion.div>

        {/* 거절 도장 */}
        <motion.div className="fa-stamp fa-stamp-no" style={{ opacity: noOpacity }}>
          거절 👎
        </motion.div>

        {/* 카드 내용 */}
        <div className="relative z-10 flex w-full flex-col items-center p-5 text-center">
          <div className="fa-chip mb-4">{card.concept}</div>

          <motion.div
            className="mb-3 text-6xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            {card.emoji}
          </motion.div>

          <h3 className="mb-3 text-base font-bold">{card.role}</h3>

          <div className="mb-4 w-full">
            <p className="fa-card-quote p-4 text-sm font-medium leading-relaxed break-keep">
              "{card.text}"
            </p>
          </div>

          {/* 선택지 힌트 */}
          <div className="flex w-full justify-between border-t border-white/10 pt-4 text-[11px] font-bold">
            <div className="fa-hint-no flex w-1/2 flex-col items-start pr-3">
              <span className="flex items-center gap-1">👎 거절</span>
              <span className="fa-dim mt-1.5 text-[10px] font-normal leading-tight break-keep">
                {card.reject.label}
              </span>
            </div>
            <div className="fa-hint-yes flex w-1/2 flex-col items-end pl-3">
              <span className="flex items-center gap-1">승인 👍</span>
              <span className="fa-dim mt-1.5 text-right text-[10px] font-normal leading-tight break-keep">
                {card.approve.label}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameCard;

import { motion } from "framer-motion";

interface StatBarProps {
  value: number;
  label: string;
  icon: string;
  /** fa-bar-eng 등 색상 클래스 */
  colorClass: string;
  /** 드래그 미리보기 변화량(0이면 표시 안 함) */
  showChange: number;
}

/** 수치 하나를 보여주는 막대. 드래그 중이면 변화 예상 구간을 겹쳐 보여준다. */
const StatBar = ({ value, label, icon, colorClass, showChange }: StatBarProps) => {
  return (
    <div className="relative mb-1 flex w-full flex-col">
      <div className="fa-dim mb-1 flex justify-between text-[10px] font-bold">
        <span>
          {icon} {label}
        </span>
        <span>{Math.round(value)}%</span>
      </div>
      <div
        className="fa-bar-track"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        aria-label={label}
      >
        <motion.div
          className={`h-full ${colorClass}`}
          initial={false}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {showChange !== 0 && (
          <motion.div
            className={`absolute top-0 h-full ${showChange > 0 ? "fa-bar-delta-up" : "fa-bar-delta-down"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            style={{
              left: showChange > 0 ? `${value}%` : `${Math.max(0, value + showChange)}%`,
              width: `${Math.abs(showChange)}%`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StatBar;

/**
 * 완벽한 가짜 — 1부 눈 시험의 '사진' 그림 모음.
 *
 * 핵심 설계: 두 그림은 같은 스타일·같은 퀄리티의 쌍으로 그려서
 * **시각적으로 구분 단서가 전혀 없게** 만든다. (요즘 AI 생성물에는
 * 손가락 6개 같은 오류가 남지 않는다는 것을 몸으로 느끼게 하는 장치.)
 * 모든 그림은 200×150 뷰박스의 납작한(flat) 일러스트이고,
 * 콘텐츠 JSON 은 svgId 로만 그림을 참조한다.
 */
import type { ReactElement } from "react";

/* ---------- 공용 조각 ---------- */

/** 뭉게구름 */
function Cloud({ cx, cy, s = 1, fill = "#ffffff", opacity = 0.9 }: {
  cx: number; cy: number; s?: number; fill?: string; opacity?: number;
}) {
  return (
    <g opacity={opacity} transform={`translate(${cx} ${cy}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={13} ry={7} fill={fill} />
      <circle cx={-7} cy={-3} r={6} fill={fill} />
      <circle cx={4} cy={-5} r={7} fill={fill} />
    </g>
  );
}

/** 잠든 하얀 강아지(몽실이) — 두 그림에서 같은 그리기 방식을 쓴다 */
function SleepingMonsil({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})${flip ? " scale(-1 1)" : ""}`}>
      {/* 몸통 (웅크린 자세) */}
      <ellipse cx={0} cy={0} rx={30} ry={18} fill="#f7f1e3" />
      <ellipse cx={-6} cy={-6} rx={22} ry={13} fill="#fdf8ec" />
      {/* 꼬리 */}
      <path d="M26 4 q14 -2 12 -14 q-10 0 -14 9 z" fill="#f7f1e3" />
      {/* 머리 */}
      <circle cx={-22} cy={-8} r={14} fill="#fdf8ec" />
      {/* 귀 */}
      <ellipse cx={-32} cy={-17} rx={5} ry={8.5} fill="#d8b98a" transform="rotate(-24 -32 -17)" />
      <ellipse cx={-13} cy={-19} rx={5} ry={8.5} fill="#d8b98a" transform="rotate(18 -13 -19)" />
      {/* 감은 눈 (곡선) */}
      <path d="M-29 -8 q3 2.6 6 0" stroke="#5c4a38" strokeWidth={1.7} fill="none" strokeLinecap="round" />
      <path d="M-19 -8 q3 2.6 6 0" stroke="#5c4a38" strokeWidth={1.7} fill="none" strokeLinecap="round" />
      {/* 코와 입 */}
      <ellipse cx={-22} cy={-2.5} rx={2.8} ry={2.1} fill="#8a6a4d" />
      <path d="M-22 -0.5 q0 2.5 2.8 3" stroke="#8a6a4d" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      {/* 앞발 */}
      <ellipse cx={-14} cy={9} rx={9} ry={4.5} fill="#fdf8ec" />
      <line x1={-16} y1={7} x2={-16} y2={12} stroke="#e3d7bd" strokeWidth={1} />
      <line x1={-11} y1={7.5} x2={-11} y2={12.5} stroke="#e3d7bd" strokeWidth={1} />
    </g>
  );
}

/** 잠꼬대 z z z */
function Zzz({ x, y, color = "#9aa7c7" }: { x: number; y: number; color?: string }) {
  return (
    <g fill={color} fontFamily="sans-serif" fontWeight={700}>
      <text x={x} y={y} fontSize={9}>z</text>
      <text x={x + 7} y={y - 8} fontSize={11}>z</text>
      <text x={x + 16} y={y - 17} fontSize={13}>z</text>
    </g>
  );
}

/** 관람차 — 두 노을 그림에서 같은 그리기 방식을 쓴다 */
function FerrisWheel({ cx, cy, r, stroke = "#5b4a6b" }: {
  cx: number; cy: number; r: number; stroke?: string;
}) {
  const spokes = [0, 45, 90, 135];
  const cabins = [0, 60, 120, 180, 240, 300];
  return (
    <g>
      {/* 받침대 */}
      <path
        d={`M${cx - r * 0.62} ${cy + r + 16} L${cx} ${cy} L${cx + r * 0.62} ${cy + r + 16}`}
        stroke={stroke}
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
      />
      {/* 바퀴와 살 */}
      <circle cx={cx} cy={cy} r={r} stroke={stroke} strokeWidth={3} fill="none" />
      {spokes.map((deg) => (
        <line
          key={deg}
          x1={cx - r}
          y1={cy}
          x2={cx + r}
          y2={cy}
          stroke={stroke}
          strokeWidth={1.6}
          transform={`rotate(${deg} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={3.5} fill={stroke} />
      {/* 곤돌라 */}
      {cabins.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        const colors = ["#f7b955", "#ef8d9c", "#7fc7b2", "#f7b955", "#ef8d9c", "#7fc7b2"];
        return <rect key={deg} x={x - 4} y={y - 1} width={8} height={7.5} rx={2.5} fill={colors[i]} />;
      })}
    </g>
  );
}

/* ---------- 그림 1쌍 · 몽실이 낮잠 ---------- */

/** A. 창가 방석에서 낮잠 자는 몽실이 (실내) */
function MonsilNapA() {
  return (
    <g>
      {/* 벽과 바닥 */}
      <rect width={200} height={150} fill="#fbf3e4" />
      <rect y={104} width={200} height={46} fill="#ecd9b8" />
      <line x1={0} y1={104} x2={200} y2={104} stroke="#dcc49c" strokeWidth={2} />
      {/* 창문과 햇살 */}
      <rect x={118} y={18} width={62} height={56} rx={6} fill="#cfe8f7" stroke="#b98d5f" strokeWidth={4} />
      <line x1={149} y1={20} x2={149} y2={72} stroke="#b98d5f" strokeWidth={3} />
      <line x1={120} y1={46} x2={178} y2={46} stroke="#b98d5f" strokeWidth={3} />
      <circle cx={133} cy={33} r={7} fill="#ffd76a" />
      <Cloud cx={165} cy={62} s={0.6} />
      {/* 화분 */}
      <rect x={22} y={78} width={16} height={14} rx={3} fill="#c97f56" />
      <path d="M30 78 q-9 -8 -4 -18 q8 3 6 18 z" fill="#6fae62" />
      <path d="M30 78 q9 -8 4 -18 q-8 3 -6 18 z" fill="#8bc47b" />
      {/* 방석 */}
      <ellipse cx={104} cy={122} rx={44} ry={13} fill="#f0b25c" />
      <ellipse cx={104} cy={118} rx={44} ry={12} fill="#f6c377" />
      {/* 몽실이 */}
      <SleepingMonsil x={110} y={102} />
      <Zzz x={140} y={78} />
    </g>
  );
}

/** B. 잔디밭에서 낮잠 자는 몽실이 (야외) */
function MonsilNapB() {
  return (
    <g>
      {/* 하늘과 잔디 */}
      <rect width={200} height={150} fill="#d9eefb" />
      <rect y={96} width={200} height={54} fill="#a8d98d" />
      <path d="M0 96 q50 -7 100 0 t100 0 v8 h-200 z" fill="#94ce7a" />
      <Cloud cx={40} cy={26} s={0.9} />
      <Cloud cx={160} cy={38} s={0.7} />
      {/* 나무 */}
      <rect x={158} y={62} width={8} height={36} rx={3} fill="#9a6b45" />
      <circle cx={162} cy={52} r={17} fill="#6fbb5e" />
      <circle cx={149} cy={61} r={11} fill="#7fc76d" />
      <circle cx={175} cy={61} r={11} fill="#7fc76d" />
      {/* 꽃 */}
      <g>
        <line x1={30} y1={126} x2={30} y2={116} stroke="#5f9e4e" strokeWidth={2} />
        <circle cx={30} cy={113} r={4} fill="#f28cb0" />
        <circle cx={30} cy={113} r={1.6} fill="#fff2b0" />
      </g>
      <g>
        <line x1={46} y1={132} x2={46} y2={123} stroke="#5f9e4e" strokeWidth={2} />
        <circle cx={46} cy={120} r={3.5} fill="#f6c34f" />
        <circle cx={46} cy={120} r={1.4} fill="#fff6d8" />
      </g>
      {/* 나비 */}
      <g transform="translate(70 60)">
        <ellipse cx={-3.5} cy={0} rx={4} ry={5.5} fill="#f2a2c0" transform="rotate(-24)" />
        <ellipse cx={3.5} cy={0} rx={4} ry={5.5} fill="#f7bcd2" transform="rotate(24)" />
        <line x1={0} y1={-4} x2={0} y2={5} stroke="#6b5a4a" strokeWidth={1.6} strokeLinecap="round" />
      </g>
      {/* 몽실이 (반대 방향으로 누움) */}
      <SleepingMonsil x={98} y={116} flip />
      <Zzz x={58} y={96} color="#7fa06b" />
    </g>
  );
}

/* ---------- 그림 2쌍 · 누리랜드 노을 ---------- */

/** 노을 하늘 (두 그림 공용) */
function SunsetSky() {
  return (
    <g>
      <rect width={200} height={150} fill="#f9c66f" />
      <rect width={200} height={64} fill="#f2a45c" />
      <rect width={200} height={30} fill="#e97f5f" />
      <circle cx={100} cy={92} r={15} fill="#ffe08a" />
      <circle cx={100} cy={92} r={22} fill="#ffe08a" opacity={0.35} />
    </g>
  );
}

/** A. 관람차와 풍선이 있는 노을 */
function NurilandA() {
  return (
    <g>
      <SunsetSky />
      <Cloud cx={38} cy={24} s={0.8} fill="#fbd9a8" opacity={0.8} />
      <Cloud cx={162} cy={40} s={0.65} fill="#fbd9a8" opacity={0.8} />
      {/* 땅 */}
      <rect y={118} width={200} height={32} fill="#7d5a78" />
      <path d="M0 118 q60 -8 120 0 t80 0 v32 h-200 z" fill="#6b4d68" />
      {/* 관람차 */}
      <FerrisWheel cx={62} cy={74} r={30} />
      {/* 풍선 */}
      <g>
        <ellipse cx={152} cy={52} rx={9} ry={11} fill="#ef8d9c" />
        <path d="M152 63 l-2 4 h4 z" fill="#d76e80" />
        <path d="M152 67 q-3 14 3 26" stroke="#8a5f57" strokeWidth={1.4} fill="none" />
      </g>
      {/* 가로등 */}
      <line x1={178} y1={118} x2={178} y2={92} stroke="#4f3b4d" strokeWidth={3} strokeLinecap="round" />
      <circle cx={178} cy={88} r={4.5} fill="#ffe08a" />
    </g>
  );
}

/** B. 관람차와 성이 있는 노을 */
function NurilandB() {
  return (
    <g>
      <SunsetSky />
      <Cloud cx={140} cy={22} s={0.8} fill="#fbd9a8" opacity={0.8} />
      <Cloud cx={40} cy={44} s={0.65} fill="#fbd9a8" opacity={0.8} />
      {/* 땅 */}
      <rect y={118} width={200} height={32} fill="#7d5a78" />
      <path d="M0 118 q70 -8 140 0 t60 0 v32 h-200 z" fill="#6b4d68" />
      {/* 성 (실루엣 + 지붕) */}
      <g>
        <rect x={26} y={84} width={14} height={34} fill="#5b4a6b" />
        <rect x={58} y={84} width={14} height={34} fill="#5b4a6b" />
        <rect x={38} y={92} width={22} height={26} fill="#6d5a80" />
        <path d="M26 84 l7 -14 l7 14 z" fill="#a34d6b" />
        <path d="M58 84 l7 -14 l7 14 z" fill="#a34d6b" />
        <path d="M41 92 l8 -12 l8 12 z" fill="#b25e7c" />
        <line x1={49} y1={80} x2={49} y2={72} stroke="#4f3b4d" strokeWidth={1.6} />
        <path d="M49 72 l8 2.5 l-8 2.5 z" fill="#f6c34f" />
        <rect x={45} y={104} width={8} height={14} rx={4} fill="#3f3350" />
      </g>
      {/* 관람차 (오른쪽, 조금 작게) */}
      <FerrisWheel cx={142} cy={80} r={26} />
      {/* 새 두 마리 */}
      <path d="M96 34 q4 -4 8 0 q4 -4 8 0" stroke="#6b4d55" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <path d="M120 26 q3 -3 6 0 q3 -3 6 0" stroke="#6b4d55" strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------- 그림 사전과 렌더러 ---------- */

export const DF_SCENES: Record<string, () => ReactElement> = {
  "monsil-nap-a": MonsilNapA,
  "monsil-nap-b": MonsilNapB,
  "nuriland-a": NurilandA,
  "nuriland-b": NurilandB,
};

/** JSON 의 svgId 로 그림을 그려 주는 컴포넌트 */
export function DfScene({ svgId, title, className }: {
  svgId?: string;
  title: string;
  className?: string;
}) {
  const scene = svgId ? DF_SCENES[svgId] : undefined;
  return (
    <svg viewBox="0 0 200 150" role="img" aria-label={title} className={className}>
      {scene ? scene() : <rect width={200} height={150} fill="#eee6d5" />}
    </svg>
  );
}

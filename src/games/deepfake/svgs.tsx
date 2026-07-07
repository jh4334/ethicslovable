/**
 * 딥페이크 탐정단 — "사진 증거" 그림 모음.
 *
 * 모든 사진은 200×150 뷰박스의 납작한(flat) 일러스트로 코드에 직접 그린다.
 * 가짜 사진에는 AI 생성물의 대표적인 오류(손가락 6개, 그림자 방향 오류,
 * 뭉개진 글자, 귀 3개, 똑같은 양손, 뭉개진 배경 얼굴)를 눈에 보이게 그려 넣고,
 * 그 위치를 핫스팟(hotspots)으로 노출한다. 콘텐츠 JSON 은 svgId 와
 * 핫스팟 id 로만 이 그림들을 참조한다.
 */
import type { ReactElement } from "react";

/** 단서 찾기에서 클릭 판정에 쓰는 네모 영역 (뷰박스 좌표계) */
export interface DfHotspot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DfSceneDef {
  render: () => ReactElement;
  /** 이상한 곳(anomaly) id → 클릭 영역 */
  hotspots: Record<string, DfHotspot>;
}

/* ---------- 공용 조각 ---------- */

/** 해 (빛나는 원 + 광선) */
function Sun({ cx, cy }: { cx: number; cy: number }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <g>
      {rays.map((deg) => (
        <line
          key={deg}
          x1={cx}
          y1={cy - 15}
          x2={cx}
          y2={cy - 19}
          stroke="#f5b83d"
          strokeWidth={2.5}
          strokeLinecap="round"
          transform={`rotate(${deg} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={11} fill="#ffd76a" />
    </g>
  );
}

/** 나무 한 그루 */
function Tree({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 3} y={y - 16} width={6} height={16} rx={2} fill="#9a6b45" />
      <circle cx={x} cy={y - 24} r={13} fill="#6fbb5e" />
      <circle cx={x - 9} cy={y - 17} r={9} fill="#7fc76d" />
      <circle cx={x + 9} cy={y - 17} r={9} fill="#7fc76d" />
    </g>
  );
}

/* ---------- 사건 1 · 몽실이와 악수 (가짜: 손가락 6개) ---------- */

function MonsilHandshake() {
  // 손바닥 중심 (126, 94) 에서 왼쪽으로 부챗살처럼 퍼지는 손가락 6개
  const fingers: Array<[number, number, number, number]> = [
    [119, 87, 105, 74],
    [116, 90, 100, 81],
    [115, 94, 98, 91],
    [116, 98, 100, 101],
    [119, 101, 105, 110],
    [123, 104, 113, 116],
  ];
  return (
    <g>
      <rect width={200} height={150} fill="#d9ecf9" />
      <rect y={108} width={200} height={42} fill="#a5d68f" />
      <circle cx={168} cy={26} r={9} fill="#ffffff" opacity={0.8} />
      <circle cx={150} cy={31} r={7} fill="#ffffff" opacity={0.8} />

      {/* 몽실이 */}
      <ellipse cx={56} cy={113} rx={28} ry={17} fill="#f6edd9" />
      <path d="M30 108 q-10 -6 -6 -14 q8 2 10 10 z" fill="#f6edd9" />
      <circle cx={58} cy={76} r={21} fill="#f6edd9" />
      <ellipse cx={41} cy={62} rx={7} ry={13} fill="#c9935d" transform="rotate(-28 41 62)" />
      <ellipse cx={75} cy={62} rx={7} ry={13} fill="#c9935d" transform="rotate(28 75 62)" />
      <circle cx={51} cy={73} r={2.4} fill="#3b3228" />
      <circle cx={66} cy={73} r={2.4} fill="#3b3228" />
      <ellipse cx={58} cy={81} rx={3.6} ry={2.6} fill="#6b4a35" />
      <path d="M58 84 q0 4 -5 4 M58 84 q0 4 5 4" stroke="#6b4a35" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      {/* 들어 올린 앞발 */}
      <ellipse cx={86} cy={96} rx={9} ry={6.5} fill="#f6edd9" transform="rotate(-25 86 96)" />

      {/* 사람 팔 + 손가락 6개 손 */}
      <rect x={138} y={84} width={64} height={21} rx={10.5} fill="#7a9bd8" />
      {fingers.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#f6c39a"
          strokeWidth={5.5}
          strokeLinecap="round"
        />
      ))}
      <circle cx={126} cy={94} r={11} fill="#f6c39a" />
    </g>
  );
}

/* ---------- 사건 4 · 은하수 다섯 콘서트 (가짜: 뭉개진 현수막 + 뭉개진 얼굴) ---------- */

function GalaxyConcert() {
  const idolX = [55, 77.5, 100, 122.5, 145];
  const idolColors = ["#e26d8f", "#e9a13b", "#59b56e", "#5a8fd8", "#9b6fd8"];
  return (
    <g>
      <rect width={200} height={150} fill="#2e2a55" />
      {/* 조명 */}
      <polygon points="45,0 20,100 75,100" fill="#ffffff" opacity={0.07} />
      <polygon points="100,0 78,100 122,100" fill="#ffffff" opacity={0.07} />
      <polygon points="155,0 125,100 180,100" fill="#ffffff" opacity={0.07} />

      {/* 현수막 — 글자가 구불구불 뭉개져 읽을 수 없다 */}
      <rect x={38} y={10} width={124} height={26} rx={4} fill="#f7f3e8" />
      <g stroke="#4a4370" strokeWidth={3} fill="none" strokeLinecap="round">
        <path d="M47 25 q3 -9 7 -1 q3 6 7 -3 q2 -5 6 2" />
        <path d="M74 19 q7 8 2 12 q-6 3 -3 -5" />
        <path d="M90 26 q4 -10 9 -3 q4 5 9 -2" />
        <path d="M116 18 q-5 10 2 11 q6 1 8 -6" />
        <path d="M136 25 q5 -8 9 -1 q3 5 8 -4" />
      </g>
      <ellipse cx={106} cy={22} rx={4} ry={6} fill="#4a4370" opacity={0.3} />

      {/* 무대와 은하수 다섯 (5인조) */}
      <rect x={20} y={98} width={160} height={13} rx={3} fill="#443d78" />
      {idolX.map((cx, i) => (
        <g key={i}>
          <path d={`M${cx - 8} 98 L${cx - 6} 74 q6 -5 12 0 L${cx + 8} 98 z`} fill={idolColors[i]} />
          <circle cx={cx} cy={65} r={7} fill="#f6c39a" />
          <path d={`M${cx - 7} 63 q7 -8 14 0 q-3 -3 -7 -3 q-4 0 -7 3`} fill="#3b3228" />
          <line x1={cx + 6} y1={78} x2={cx + 10} y2={72} stroke="#2b2750" strokeWidth={2} strokeLinecap="round" />
          <circle cx={cx + 10.5} cy={71} r={1.8} fill="#cfd3ea" />
        </g>
      ))}

      {/* 맨 앞줄 관객 (뒤통수) */}
      {[15, 45, 75, 105, 135, 165, 195].map((x) => (
        <circle key={x} cx={x} cy={152} r={13.5} fill="#1d1a3a" />
      ))}

      {/* 돌아본 관객 — 얼굴이 녹은 것처럼 뭉개졌다 */}
      <path
        d="M17 131 q-1 -12 10 -12 q11 0 10 13 q-0.5 8 -6 10 q-3 -4 -5 1 q-7 -1 -9 -12 z"
        fill="#f6c39a"
      />
      <path d="M15 122 q11 -8 23 1 q-2 -6 -11 -6 q-9 0 -12 5 z" fill="#5b4632" />
      <g stroke="#b97f4e" strokeWidth={1.8} fill="none" strokeLinecap="round">
        <path d="M21 128 q3 5 6 0 q3 -5 6 2" />
        <path d="M25 134 q3 6 -1 8" />
      </g>
      <ellipse cx={31} cy={128} rx={1.6} ry={4.2} fill="#8a5a30" opacity={0.75} transform="rotate(24 31 128)" />
    </g>
  );
}

/* ---------- 사건 7 · 누리랜드 퍼레이드 (가짜: 그림자 방향 + 똑같은 양손) ---------- */

/** 왼손·오른손이 완전히 똑같다 — 엄지가 둘 다 왼쪽에 붙어 있다 */
function IdenticalHand({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g fill="#f6c39a">
      <circle cx={cx - 3.2} cy={cy - 6} r={2.6} />
      <circle cx={cx + 0.4} cy={cy - 7} r={2.6} />
      <circle cx={cx + 4} cy={cy - 5.5} r={2.6} />
      <ellipse cx={cx - 7.5} cy={cy + 1.5} rx={3.2} ry={4.6} transform={`rotate(-30 ${cx - 7.5} ${cy + 1.5})`} />
      <circle cx={cx} cy={cy} r={6.8} />
    </g>
  );
}

function NurilandParade() {
  return (
    <g>
      <rect width={200} height={150} fill="#d9ecf9" />
      {/* 해가 왼쪽 위에 있다 */}
      <Sun cx={26} cy={24} />

      {/* 누리랜드 성 */}
      <rect x={136} y={56} width={44} height={52} rx={3} fill="#f3e6f9" />
      <rect x={128} y={42} width={13} height={66} rx={3} fill="#e3cff2" />
      <rect x={175} y={42} width={13} height={66} rx={3} fill="#e3cff2" />
      <polygon points="128,43 134.5,24 141,43" fill="#b287d8" />
      <polygon points="175,43 181.5,24 188,43" fill="#b287d8" />
      <line x1={134.5} y1={24} x2={134.5} y2={16} stroke="#9b6fd8" strokeWidth={1.6} />
      <polygon points="134.5,16 145,19 134.5,22" fill="#e2556a" />
      <path d="M149 108 v-16 q9 -13 18 0 v16 z" fill="#b287d8" />
      <circle cx={158} cy={70} r={5} fill="#ffffff" />

      <rect y={108} width={200} height={42} fill="#a5d68f" />
      <rect y={116} width={200} height={9} fill="#e8d9a8" />

      {/* 그림자가 해와 같은 쪽(왼쪽)으로 나 있다 — 이상! */}
      <ellipse cx={66} cy={124} rx={30} ry={5.5} fill="#3f3f3f" opacity={0.35} />

      {/* 손 흔드는 사람 */}
      <rect x={88} y={112} width={5.5} height={12} rx={2.5} fill="#4f6bb0" />
      <rect x={98} y={112} width={5.5} height={12} rx={2.5} fill="#4f6bb0" />
      <rect x={84} y={82} width={23} height={33} rx={9} fill="#e26d8f" />
      <line x1={88} y1={88} x2={70} y2={64} stroke="#e26d8f" strokeWidth={6} strokeLinecap="round" />
      <line x1={103} y1={88} x2={121} y2={64} stroke="#e26d8f" strokeWidth={6} strokeLinecap="round" />
      <circle cx={95.5} cy={69} r={11} fill="#f6c39a" />
      <path d="M84.5 66 q11 -10 22 0 q-3 -5 -11 -5 q-8 0 -11 5 z" fill="#3b3228" />
      <circle cx={91.5} cy={69} r={1.7} fill="#3b3228" />
      <circle cx={99.5} cy={69} r={1.7} fill="#3b3228" />
      <path d="M92 74 q3.5 3 7 0" stroke="#c96f5a" strokeWidth={1.5} fill="none" strokeLinecap="round" />

      {/* 두 손이 완전히 똑같다 — 이상! */}
      <IdenticalHand cx={68} cy={59} />
      <IdenticalHand cx={123} cy={59} />
    </g>
  );
}

/* ---------- 사건 10 · 몽실이 프로필 (가짜: 귀 3개) ---------- */

function MonsilProfile() {
  return (
    <g>
      <rect width={200} height={150} fill="#fbe8ef" />
      {[
        [22, 30],
        [176, 22],
        [186, 96],
        [16, 112],
      ].map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y - 5} L${x + 1.6} ${y - 1.6} L${x + 5} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 5} L${x - 1.6} ${y + 1.6} L${x - 5} ${y} L${x - 1.6} ${y - 1.6} z`}
          fill="#f2b8cd"
        />
      ))}

      {/* 귀 3개 — 이상! (왼쪽·오른쪽 + 정수리에 하나 더) */}
      <ellipse cx={64} cy={54} rx={11} ry={20} fill="#c9935d" transform="rotate(-32 64 54)" />
      <ellipse cx={136} cy={54} rx={11} ry={20} fill="#c9935d" transform="rotate(32 136 54)" />
      <ellipse cx={100} cy={38} rx={10} ry={19} fill="#c9935d" transform="rotate(4 100 38)" />

      {/* 얼굴 */}
      <circle cx={100} cy={90} r={43} fill="#f6edd9" />
      <circle cx={85} cy={85} r={4} fill="#3b3228" />
      <circle cx={115} cy={85} r={4} fill="#3b3228" />
      <circle cx={86.4} cy={83.6} r={1.3} fill="#ffffff" />
      <circle cx={116.4} cy={83.6} r={1.3} fill="#ffffff" />
      <ellipse cx={76} cy={97} rx={5.5} ry={3.5} fill="#f2b8cd" />
      <ellipse cx={124} cy={97} rx={5.5} ry={3.5} fill="#f2b8cd" />
      <path d="M96 96 q4 -3 8 0 q0 4 -4 4 q-4 0 -4 -4 z" fill="#6b4a35" />
      <path d="M100 100 q0 5 -6 5 M100 100 q0 5 6 5" stroke="#6b4a35" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d="M97 105 q3 6 6 0 q-1 5 -3 5 q-2 0 -3 -5 z" fill="#e2778c" />

      {/* 목걸이 */}
      <path d="M65 121 q35 17 70 0 l2.5 7 q-38 19 -75 0 z" fill="#e2556a" />
      <circle cx={100} cy={135} r={5} fill="#f5c542" />
    </g>
  );
}

/* ---------- 사건 3 · 몽실이 산책 (진짜) ---------- */

function MonsilWalk() {
  return (
    <g>
      <rect width={200} height={150} fill="#d9ecf9" />
      {/* 해가 오른쪽 위 */}
      <Sun cx={172} cy={24} />
      <circle cx={52} cy={26} r={8} fill="#ffffff" opacity={0.8} />
      <circle cx={38} cy={30} r={6} fill="#ffffff" opacity={0.8} />

      <rect y={104} width={200} height={46} fill="#a5d68f" />
      <path d="M0 132 q100 -12 200 0 v18 h-200 z" fill="#e8d9a8" />

      <Tree x={26} y={104} />
      <Tree x={182} y={100} />
      {/* 그림자는 해(오른쪽 위)의 반대쪽인 왼쪽으로 — 정상 */}
      <ellipse cx={18} cy={106} rx={12} ry={3} fill="#3f3f3f" opacity={0.22} />
      <ellipse cx={174} cy={102} rx={12} ry={3} fill="#3f3f3f" opacity={0.22} />
      <ellipse cx={106} cy={127} rx={17} ry={4} fill="#3f3f3f" opacity={0.28} />
      <ellipse cx={52} cy={129} rx={14} ry={3.5} fill="#3f3f3f" opacity={0.28} />

      {/* 산책하는 사람 — 손은 단순한 동그라미 (이상한 곳 없음) */}
      <rect x={114} y={112} width={5} height={13} rx={2.5} fill="#4f6bb0" />
      <rect x={122} y={112} width={5} height={13} rx={2.5} fill="#4f6bb0" />
      <rect x={110} y={82} width={21} height={32} rx={9} fill="#59b56e" />
      <line x1={114} y1={90} x2={102} y2={104} stroke="#59b56e" strokeWidth={5.5} strokeLinecap="round" />
      <circle cx={101} cy={106} r={4} fill="#f6c39a" />
      <circle cx={120.5} cy={71} r={10} fill="#f6c39a" />
      <path d="M110.5 69 q10 -9 20 0 q-3 -5 -10 -5 q-7 0 -10 5 z" fill="#5b4632" />
      <circle cx={117} cy={71} r={1.6} fill="#3b3228" />
      <circle cx={124} cy={71} r={1.6} fill="#3b3228" />
      <path d="M117.5 76 q3 2.5 6 0" stroke="#c96f5a" strokeWidth={1.4} fill="none" strokeLinecap="round" />

      {/* 목줄 */}
      <path d="M100 108 q-18 6 -32 8" stroke="#8a6d4f" strokeWidth={1.7} fill="none" />

      {/* 몽실이 */}
      <ellipse cx={58} cy={120} rx={17} ry={10.5} fill="#f6edd9" />
      <rect x={47} y={126} width={4.5} height={7} rx={2} fill="#f6edd9" />
      <rect x={66} y={126} width={4.5} height={7} rx={2} fill="#f6edd9" />
      <path d="M74 114 q9 -3 8 -11 q-7 1 -9 8 z" fill="#f6edd9" />
      <circle cx={44} cy={110} r={9.5} fill="#f6edd9" />
      <ellipse cx={37} cy={103} rx={3.6} ry={6.5} fill="#c9935d" transform="rotate(-25 37 103)" />
      <ellipse cx={51} cy={103} rx={3.6} ry={6.5} fill="#c9935d" transform="rotate(25 51 103)" />
      <circle cx={41} cy={109} r={1.4} fill="#3b3228" />
      <circle cx={47} cy={109} r={1.4} fill="#3b3228" />
      <ellipse cx={44} cy={113} rx={2} ry={1.5} fill="#6b4a35" />
    </g>
  );
}

/* ---------- 사건 6 · 무지개시장 (진짜) ---------- */

function MarketDay() {
  const stripes = [42, 62, 82, 102, 122, 142];
  return (
    <g>
      <rect width={200} height={150} fill="#fdf3e3" />

      {/* 간판 — 글자가 또렷하게 읽힌다 (진짜의 특징) */}
      <rect x={52} y={7} width={96} height={19} rx={4} fill="#ffffff" stroke="#e0cdb2" strokeWidth={1} />
      <text
        x={100}
        y={21}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="#4a4038"
        fontFamily="inherit"
      >
        무지개시장
      </text>

      {/* 차양 */}
      <rect x={34} y={30} width={132} height={16} fill="#e2556a" />
      {stripes.map((x) => (
        <rect key={x} x={x} y={30} width={10} height={16} fill="#f7f3e8" />
      ))}
      <path
        d="M34 46 q5.5 7 11 0 q5.5 7 11 0 q5.5 7 11 0 q5.5 7 11 0 q5.5 7 11 0 q5.5 7 11 0 q5.5 7 11 0 q5.5 7 11 0 q5.5 7 11 0 q5.5 7 11 0 q5.5 7 11 0 q5.5 7 11 0 v-8 h-132 z"
        fill="#e2556a"
      />
      <rect x={36} y={46} width={5} height={68} rx={2} fill="#9a6b45" />
      <rect x={159} y={46} width={5} height={68} rx={2} fill="#9a6b45" />

      {/* 좌판과 과일 상자 */}
      <rect x={34} y={88} width={132} height={9} rx={2} fill="#c98f5f" />
      <rect x={44} y={68} width={34} height={20} rx={2} fill="#d8a86a" />
      {[51, 61, 71].map((x) => (
        <circle key={x} cx={x} cy={68} r={4.5} fill="#e25555" />
      ))}
      <rect x={86} y={68} width={34} height={20} rx={2} fill="#d8a86a" />
      {[93, 103, 113].map((x) => (
        <circle key={x} cx={x} cy={68} r={4.5} fill="#f2a33c" />
      ))}

      {/* 상인 아주머니 — 얼굴이 또렷하다 */}
      <rect x={131} y={66} width={20} height={22} rx={7} fill="#5a8fd8" />
      <line x1={135} y1={70} x2={127} y2={62} stroke="#5a8fd8" strokeWidth={4.5} strokeLinecap="round" />
      <circle cx={126} cy={60.5} r={3.2} fill="#f6c39a" />
      <circle cx={141} cy={56} r={9} fill="#f6c39a" />
      <path d="M132 54 q9 -8 18 0 q-3 -4.5 -9 -4.5 q-6 0 -9 4.5 z" fill="#3b3228" />
      <circle cx={138} cy={56} r={1.5} fill="#3b3228" />
      <circle cx={144.5} cy={56} r={1.5} fill="#3b3228" />
      <path d="M138.5 60.5 q2.8 2.5 5.5 0" stroke="#c96f5a" strokeWidth={1.4} fill="none" strokeLinecap="round" />

      <rect y={114} width={200} height={36} fill="#e8d9c3" />
      {/* 장 보러 온 아이 */}
      <rect x={173} y={122} width={4} height={10} rx={2} fill="#4f6bb0" />
      <rect x={180} y={122} width={4} height={10} rx={2} fill="#4f6bb0" />
      <rect x={170} y={100} width={17} height={24} rx={7} fill="#e9a13b" />
      <circle cx={178.5} cy={92} r={8} fill="#f6c39a" />
      <path d="M170.5 90 q8 -7 16 0 q-2.5 -4 -8 -4 q-5.5 0 -8 4 z" fill="#5b4632" />
      <circle cx={175.5} cy={92} r={1.4} fill="#3b3228" />
      <circle cx={181.5} cy={92} r={1.4} fill="#3b3228" />
      <path d="M176 96 q2.5 2 5 0" stroke="#c96f5a" strokeWidth={1.3} fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------- 그림 등록부 ---------- */

export const DF_SCENES: Record<string, DfSceneDef> = {
  "monsil-handshake": {
    render: () => <MonsilHandshake />,
    hotspots: {
      "six-fingers": { x: 92, y: 66, w: 50, h: 58 },
    },
  },
  "galaxy-concert": {
    render: () => <GalaxyConcert />,
    hotspots: {
      "mushy-sign": { x: 38, y: 8, w: 124, h: 30 },
      "melted-face": { x: 12, y: 114, w: 32, h: 34 },
    },
  },
  "nuriland-parade": {
    render: () => <NurilandParade />,
    hotspots: {
      "wrong-shadow": { x: 34, y: 114, w: 58, h: 18 },
      "twin-hand-left": { x: 54, y: 46, w: 26, h: 26 },
      "twin-hand-right": { x: 110, y: 46, w: 26, h: 26 },
    },
  },
  "monsil-profile": {
    render: () => <MonsilProfile />,
    hotspots: {
      "third-ear": { x: 84, y: 16, w: 32, h: 42 },
    },
  },
  "monsil-walk": {
    render: () => <MonsilWalk />,
    hotspots: {},
  },
  "market-day": {
    render: () => <MarketDay />,
    hotspots: {},
  },
};

/** 콘텐츠 JSON 이 모르는 svgId 를 가리켜도 게임이 멈추지 않게 하는 대체 그림 */
export const DF_FALLBACK_SCENE: DfSceneDef = {
  render: () => (
    <g>
      <rect width={200} height={150} fill="#eceef3" />
      <text x={100} y={78} textAnchor="middle" fontSize={10} fill="#8a8f9c" fontFamily="inherit">
        사진을 찾을 수 없어요
      </text>
    </g>
  ),
  hotspots: {},
};

export function getScene(svgId: string): DfSceneDef {
  return DF_SCENES[svgId] ?? DF_FALLBACK_SCENE;
}

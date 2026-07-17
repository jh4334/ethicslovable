import type { GameId } from "@/lib/progress";

/**
 * 게임 레지스트리 — 학습 순서(차시)대로 정렬.
 * 포털 카드와 라우팅이 이 목록을 사용한다.
 */
export interface GameMeta {
  id: GameId;
  /** 차시 (1~16) */
  lesson: number;
  /** 챕터: 1부(추천 알고리즘) / 2부(AI 알고리즘) / 3부(디지털 생활) / 4부(AI 윤리) */
  chapter: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  /** 학습 목표 한 줄 (교사·학생용 안내) */
  goal: string;
  /** 예상 소요 시간 (분) */
  minutes: number;
  emoji: string;
  path: string;
}

export interface ChapterMeta {
  chapter: 1 | 2 | 3 | 4;
  title: string;
  tagline: string;
}

export const CHAPTERS: ChapterMeta[] = [
  {
    chapter: 1,
    title: "1부 · 알고리즘의 비밀",
    tagline: "누리피드와 누리TV의 추천 알고리즘을 파헤쳐요",
  },
  {
    chapter: 2,
    title: "2부 · 인공지능과 살아가기",
    tagline: "누리소프트 AI 연구소에서 인공지능의 속마음을 알아봐요",
  },
  {
    chapter: 3,
    title: "3부 · 슬기로운 누리 생활",
    tagline: "누리마을 지킴이가 되어 매일 쓰는 앱 속 설계를 꿰뚫어 봐요",
  },
  {
    chapter: 4,
    title: "4부 · AI와 바르게 쓰기",
    tagline: "충북형 AI 윤리 가이드라인으로 배우는, AI를 대하는 나의 태도",
  },
];

export const GAMES: GameMeta[] = [
  {
    id: "feed-algorithm",
    lesson: 1,
    chapter: 1,
    title: "알고리즘 설계자",
    subtitle: "피드 알고리즘 이해",
    goal: "추천 알고리즘이 어떤 기준과 이익으로 움직이는지 알아봐요",
    minutes: 15,
    emoji: "🧙",
    path: "/games/feed-algorithm",
  },
  {
    id: "filter-bubble",
    lesson: 2,
    chapter: 1,
    title: "필터버블 탐지기",
    subtitle: "필터버블 체험",
    goal: "내 선택이 어떻게 정보 편식으로 이어지는지 체험해요",
    minutes: 10,
    emoji: "🫧",
    path: "/games/filter-bubble",
  },
  {
    id: "social-insight",
    lesson: 3,
    chapter: 1,
    title: "추천 요정 훈련소",
    subtitle: "사회적 영향 통찰",
    goal: "알고리즘의 눈으로 추천을 해 보며 그 영향력을 통찰해요",
    minutes: 15,
    emoji: "🔮",
    path: "/games/social-insight",
  },
  {
    id: "trend-tycoon",
    lesson: 4,
    chapter: 1,
    title: "알고리즘 연구소장",
    subtitle: "플랫폼 운영자 관점",
    goal: "플랫폼 운영자가 되어 수익과 책임 사이의 딜레마를 겪어봐요",
    minutes: 15,
    emoji: "🎛️",
    path: "/games/trend-tycoon",
  },
  {
    id: "data-bias",
    lesson: 5,
    chapter: 2,
    title: "데이터 편식쟁이 AI",
    subtitle: "AI 학습과 데이터 편향",
    goal: "AI는 먹은 데이터만큼만 안다는 것을 직접 학습시키며 체험해요",
    minutes: 15,
    emoji: "🍚",
    path: "/games/data-bias",
  },
  {
    id: "deepfake",
    lesson: 6,
    chapter: 2,
    title: "완벽한 가짜",
    subtitle: "AI 생성물 검증",
    goal: "눈으로 못 가리는 AI 가짜, 4단계 검증 절차로 판별해요",
    minutes: 15,
    emoji: "🎭",
    path: "/games/deepfake",
  },
  {
    id: "fact-check",
    lesson: 7,
    chapter: 2,
    title: "누리봇 사실 검증단",
    subtitle: "AI 답변 검증",
    goal: "AI 챗봇의 그럴듯한 거짓말(환각)을 자료와 대조해 찾아내요",
    minutes: 15,
    emoji: "✅",
    path: "/games/fact-check",
  },
  {
    id: "data-trail",
    lesson: 8,
    chapter: 2,
    title: "내 데이터의 여행",
    subtitle: "개인정보와 맞춤 광고",
    goal: "내 클릭이 광고가 되기까지, 데이터의 여행을 따라가요",
    minutes: 15,
    emoji: "🧳",
    path: "/games/data-trail",
  },
  {
    id: "short-form",
    lesson: 9,
    chapter: 3,
    title: "멈출 수 없는 화면",
    subtitle: "숏폼과 시간 감각",
    goal: "무한 숏폼 피드를 체험하며 시간을 훔치는 설계를 알아채요",
    minutes: 15,
    emoji: "📱",
    path: "/games/short-form",
  },
  {
    id: "gacha-box",
    lesson: 10,
    chapter: 3,
    title: "뽑기 상자의 비밀",
    subtitle: "확률형 아이템과 소비",
    goal: "뽑기를 직접 돌려 보고 확률과 상술의 비밀을 계산해요",
    minutes: 15,
    emoji: "🎁",
    path: "/games/gacha-box",
  },
  {
    id: "search-detective",
    lesson: 11,
    chapter: 3,
    title: "검색 결과 탐정",
    subtitle: "검색 리터러시",
    goal: "검색 결과에서 광고·협찬·의심스러운 출처를 가려내요",
    minutes: 15,
    emoji: "🔎",
    path: "/games/search-detective",
  },
  {
    id: "chat-guard",
    lesson: 12,
    chapter: 3,
    title: "단톡방을 지켜라",
    subtitle: "메신저와 디지털 시민성",
    goal: "우리 반 단톡방의 루머·피싱·저격 상황에 슬기롭게 대응해요",
    minutes: 15,
    emoji: "💬",
    path: "/games/chat-guard",
  },
  {
    id: "ai-privacy",
    lesson: 13,
    chapter: 4,
    title: "누리봇에게 말해도 될까?",
    subtitle: "AI와 개인정보 (안전)",
    goal: "생성형 AI에게 말해도 되는 것과 안 되는 것을 가려요",
    minutes: 15,
    emoji: "🔒",
    path: "/games/ai-privacy",
  },
  {
    id: "ai-fair",
    lesson: 14,
    chapter: 4,
    title: "모두의 AI",
    subtitle: "AI와 공정·포용 (공정)",
    goal: "AI가 모두를 똑같이 잘 돕는지 살피고 공정을 생각해요",
    minutes: 15,
    emoji: "⚖️",
    path: "/games/ai-fair",
  },
  {
    id: "ai-copyright",
    lesson: 15,
    chapter: 4,
    title: "누가 만들었게?",
    subtitle: "AI와 저작권 (책임)",
    goal: "AI로 만든 것을 쓸 때 지킬 책임과 저작권을 배워요",
    minutes: 15,
    emoji: "📝",
    path: "/games/ai-copyright",
  },
  {
    id: "ai-grow",
    lesson: 16,
    chapter: 4,
    title: "AI와 함께 크는 나",
    subtitle: "AI로 성장하기 (성장)",
    goal: "AI를 베끼기가 아니라 배움의 도구로 주도적으로 써요",
    minutes: 20,
    emoji: "🌱",
    path: "/games/ai-grow",
  },
];

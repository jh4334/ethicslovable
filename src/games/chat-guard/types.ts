/**
 * 12차시 · 단톡방을 지켜라 — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/chat-guard.json 과 1:1 대응한다.
 * (배포본에서는 data/chat-guard.json 을 고치면 게임 내용이 바뀐다.)
 */

/** 선택의 질 — 지킴이 판정 카드의 등급 */
export type CgQuality = "wise" | "soso" | "risky";

/** 단톡방 멤버 (이모지 아바타) */
export interface CgMember {
  name: string;
  emoji: string;
}

/** 단톡방에 올라오는 메시지 한 개 */
export interface CgMessage {
  /** 보낸 사람 이름 — members 목록의 name과 일치해야 한다 */
  sender: string;
  /** 말풍선 본문 */
  text: string;
  /** 큰 이모티콘 스티커 (선택) */
  sticker?: string;
  /** 사진 메시지 — 이모지 콜라주로 표현 (선택) */
  photo?: string;
}

/** 선택 후 친구들의 반응 메시지 */
export interface CgReaction {
  sender: string;
  text: string;
}

/** '당신의 차례'에서 고르는 선택지 */
export interface CgChoice {
  /** 내가 보낼 메시지(또는 괄호로 감싼 행동 — 예: "(조용히 있는다)") */
  text: string;
  quality: CgQuality;
  /** 선택별 분기 — 친구들의 반응 2~3개 */
  reactions: CgReaction[];
  /** 지킴이 판정 카드 해설 — '왜'를 설명 */
  feedback: string;
}

/** 에피소드 하나 = 하루 중 한 장면 */
export interface CgEpisode {
  id: string;
  /** 시간대 구분선 라벨 (예: "🌅 아침 · 등교 전") */
  timeLabel: string;
  /** 첫 메시지 시각 — "오전 8:12" 형식. 이후 말풍선 시각은 1분씩 자동 증가 */
  clock: string;
  /** 진행 표시용 소제목 */
  title: string;
  messages: CgMessage[];
  /** '당신의 차례예요' 아래에 보여 줄 상황 질문 */
  prompt: string;
  /** 항상 3개 — wise/soso/risky 하나씩 (화면에는 섞여서 나온다) */
  choices: CgChoice[];
}

/** 시작 화면 문구 */
export interface CgIntro {
  title: string;
  badge: string;
  story: string;
  mission: string;
  tip: string;
  startLabel: string;
}

/** 지킴이 배지 수 기준 등급 */
export interface CgGrade {
  /** 배지 수가 이 값 이상일 때 적용 */
  min: number;
  emoji: string;
  title: string;
  desc: string;
}

/** 마무리(약속 만들기·수료) 문구 */
export interface CgFinale {
  promiseTitle: string;
  promiseGuide: string;
  promiseButton: string;
  cardTitle: string;
  cardGuide: string;
  graduationTitle: string;
  graduationMessage: string;
  retryButton: string;
  homeButton: string;
}

/** 화면 곳곳의 짧은 문구 */
export interface CgLabels {
  yourTurn: string;
  chooseHint: string;
  typingSuffix: string;
  nextEpisode: string;
  makePromise: string;
  inputPlaceholder: string;
  dateDivider: string;
  badgeLabel: string;
  badgeEarned: string;
  episodeLabel: string;
  verdictTitles: Record<CgQuality, string>;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface CgContent {
  $설명?: string;
  intro: CgIntro;
  roomTitle: string;
  /** 방 제목 옆의 인원 수 (화면에 보이지 않는 반 친구 포함) */
  memberCount: number;
  members: CgMember[];
  episodes: CgEpisode[];
  /** 약속 후보 6개 — 모두 좋은 항목, 그중 3개를 고른다 */
  promiseCandidates: string[];
  grades: CgGrade[];
  finale: CgFinale;
  labels: CgLabels;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

export type Phase = "start" | "chat" | "promise" | "finale";

/** 에피소드 내부 단계: 메시지 등장 → 선택 → 반응 등장 → 판정 */
export type Stage = "intro" | "choice" | "reacting" | "verdict";

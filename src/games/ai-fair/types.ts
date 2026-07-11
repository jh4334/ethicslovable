/**
 * 모두의 AI (14차시 · 포용 퍼즐) — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/ai-fair.json 과 1:1 대응한다.
 * (배포본에서는 data/ai-fair.json 을 고치면 재빌드 없이 게임 내용이 바뀐다.)
 */

/** 누리봇을 쓰려는 친구 한 명 (교사 편집 가능) */
export interface AfUser {
  id: string;
  emoji: string;
  who: string;
  /** 접근 장벽 id — barriers[].id 중 하나. 기본 사용자는 빈 문자열 */
  barrierId: string;
  /** 기본 누리봇으로도 처음부터 잘 쓰는가 (평균적인 사용자) */
  canUseBaseline: boolean;
  /** 이 친구가 '이제 쓸 수 있게 됐을 때' 하는 말 */
  fixedLine: string;
  /** 기본 사용자 설명(선택) — 왜 처음부터 잘 쓰는지 */
  baseLine?: string;
}

/** 접근 장벽 한 종류 */
export interface AfBarrier {
  id: string;
  emoji: string;
  name: string;
  /** 아직 못 쓸 때 누리봇이 보이는 반응 */
  blockedLine: string;
  /** 관련 세부원칙 꼬리표 */
  principle: string;
}

/** 개선 카드 한 장 */
export interface AfImprovement {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  /** 이 카드가 없애 주는 장벽 id 목록 (빈 배열이면 함정 카드) */
  helpsBarrierIds: string[];
}

export interface AfConfig {
  /** 시작 슬롯 수 */
  slotsStart: number;
  /** 최대 슬롯 수 */
  slotsMax: number;
}

export interface AfMeta {
  gameTitle: string;
  role: string;
  tagline: string;
  introParagraphs: string[];
  startButton: string;
}

export interface AfInsight {
  title: string;
  whyTitle: string;
  whyText: string;
  mapTitle: string;
  summaryLead: string;
  closing: string;
  toResultButton: string;
}

export interface AfRule {
  emoji: string;
  title: string;
  text: string;
}

/** 시험 횟수(rounds)에 따른 설계자 등급 — maxRounds 작은 것부터 먼저 맞는 등급 */
export interface AfGrade {
  maxRounds: number;
  emoji: string;
  name: string;
  desc: string;
}

export interface AfUi {
  buildTitle: string;
  buildGuide: string;
  meterLabel: string;
  slotsLabel: string;
  trayTitle: string;
  trayGuide: string;
  equipHint: string;
  testButton: string;
  testButtonFirst: string;
  testingLine: string;
  emptySlotLabel: string;
  baselineTag: string;
  canUseTag: string;
  blockedTag: string;
  newlyLabel: string;
  stillBlockedLabel: string;
  slotGrowLine: string;
  solvedBanner: string;
  toInsightButton: string;
  helpsLabel: string;
  helpsNoneLabel: string;
  resultTitle: string;
  gradeLabel: string;
  inclusionLabel: string;
  roundsLabel: string;
  rulesTitle: string;
  finishNote: string;
  worksheetNote: string;
  mapButton: string;
  restartButton: string;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface AfContent {
  /** 교사용 편집 안내 — 게임에서는 쓰지 않는다 */
  $설명?: string[];
  meta: AfMeta;
  users: AfUser[];
  barriers: AfBarrier[];
  improvements: AfImprovement[];
  config: AfConfig;
  insight: AfInsight;
  rules: AfRule[];
  grades: AfGrade[];
  ui: AfUi;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

export type AfPhase = "intro" | "build" | "insight" | "result";

/** '다시 시험하기' 한 번의 결과 */
export interface AfTestResult {
  /** 이번 시험에서 쓸 수 있게 된 친구 id 전체 */
  enabledIds: string[];
  /** 지난 시험 대비 이번에 새로 쓸 수 있게 된 친구 id */
  newlyEnabledIds: string[];
  /** 아직 못 쓰는 친구 id */
  blockedIds: string[];
  /** 이번 시험이 끝난 뒤 슬롯이 늘었는가 */
  slotGrew: boolean;
  /** 여섯 명 모두 쓸 수 있게 됐는가 */
  solved: boolean;
}

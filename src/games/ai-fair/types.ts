/**
 * 모두의 AI (14차시 · 스테이지형 포용 퍼즐) — 콘텐츠·게임 상태 타입.
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
  /** 손님으로 설계실에 찾아왔을 때 하는 말 (장벽 있는 친구만) */
  arriveLine?: string;
  /** 이 친구가 '이제 쓸 수 있게 됐을 때' 하는 말 */
  fixedLine: string;
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
  /** 이 카드가 지금 손님을 못 도왔을 때 보여 줄 피드백 */
  failLine: string;
}

/** 최종 설계 심사 (개선을 budget개만 남기는 조합 퍼즐) */
export interface AfFinalStage {
  title: string;
  /** 소장님 브리핑 문단들 */
  briefs: string[];
  /** 남길 수 있는 개선 카드 수 */
  budget: number;
  pickGuide: string;
  testButton: string;
  /** budget개를 아직 못 채웠을 때 안내 */
  needMoreLine: string;
  successLine: string;
  /** 실패 시 머리말 (아래에 못 쓰게 된 친구 목록 표시) */
  failLead: string;
  /** 실패 시 힌트 */
  failHint: string;
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
  guestLabel: string;
  stageGuide: string;
  nuriBotLabel: string;
  barrierLabel: string;
  trayTitle: string;
  trayGuide: string;
  testButton: string;
  testingLine: string;
  retryLine: string;
  triedTag: string;
  successTitle: string;
  nextButton: string;
  toFinalButton: string;
  toInsightButton: string;
  autoSolvedTitle: string;
  autoSolvedLine: string;
  installedLabel: string;
  /** 결과 화면 — 최종으로 남긴 개선 목록 제목 */
  keptLabel: string;
  meterLabel: string;
  canUseTag: string;
  blockedTag: string;
  /** 실패 피드백 머리말 — "{카드 이름} — {이 문구}" 형태로 표시 */
  failedCardLead: string;
  helpsLabel: string;
  helpsNoneLabel: string;
  /** 아직 시험해 보지 않은 카드의 '돕는 사람' 자리에 보이는 안내 */
  helpsHiddenLabel: string;
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
  /** 손님이 찾아오는 순서 (canUseBaseline=false인 users의 id) */
  stageOrder: string[];
  barriers: AfBarrier[];
  improvements: AfImprovement[];
  finalStage: AfFinalStage;
  insight: AfInsight;
  rules: AfRule[];
  grades: AfGrade[];
  ui: AfUi;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

export type AfPhase = "intro" | "stage" | "final" | "insight" | "result";

/** 손님 스테이지의 진행 상태 */
export type AfStageStatus =
  | "pick" // 카드를 고르는 중
  | "fail" // 방금 고른 카드가 이 손님을 못 도움 — 다시 고르기
  | "solved" // 이 손님을 도왔음 — 다음 손님으로
  | "auto"; // 이미 단 개선이 이 손님까지 도움 (시험 없이 해결)

/** 최종 심사 시험 한 번의 결과 */
export interface AfFinalResult {
  /** 남긴 조합으로 쓸 수 있는 친구 id */
  enabledIds: string[];
  /** 못 쓰게 되는 친구 id */
  blockedIds: string[];
  solved: boolean;
}

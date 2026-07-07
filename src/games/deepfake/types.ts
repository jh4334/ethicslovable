/**
 * 6차시 · 완벽한 가짜 — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/deepfake.json 과 1:1 대응한다.
 * (배포본에서는 data/deepfake.json 을 고치면 게임 내용이 바뀐다.)
 *
 * 게임 구조: 1부 눈 시험(5라운드, 진짜 vs AI — 단서가 없어 사실상 못 가림)
 * → 중간 결과("눈으로는 못 가려요") → 2부 검증 수사(4사건, 도구 4개로 절차 검증)
 * → 결과(눈 vs 검증 비교 + 4단계 검증 수칙).
 */

/** 눈 시험에서 두 콘텐츠 중 한쪽을 가리키는 값 */
export type DfSide = "A" | "B";

/** 검증 도구 4종의 고유 id */
export type DfToolId = "stop" | "source" | "original" | "official";

export const DF_TOOL_IDS: DfToolId[] = ["stop", "source", "original", "official"];

/* ---------- 시작 화면 ---------- */

export interface DfIntroPlan {
  step: string;
  title: string;
  desc: string;
}

export interface DfIntro {
  badge: string;
  title: string;
  tagline: string;
  chiefName: string;
  /** 수사대장 대사 (말풍선 여러 개) */
  chiefLines: string[];
  /** '딥페이크' 개념을 1회 소개하는 문구 */
  deepfakeNote: string;
  /** 1부·2부 진행 안내 */
  plan: DfIntroPlan[];
  startLabel: string;
}

/* ---------- 1부 · 눈 시험 ---------- */

/** 눈 시험 한쪽 콘텐츠 — 글(content) 또는 그림(svgId) */
export interface DfEyeItem {
  /** 짧은 제목·캡션 */
  label: string;
  /** type이 "text"일 때의 본문 */
  content?: string;
  /** type이 "image"일 때 svgs.tsx 그림 id */
  svgId?: string;
  /** 올린 사람 표시 (가상 닉네임) */
  byline: string;
}

export interface DfEyeRound {
  id: string;
  type: "text" | "image";
  /** 라운드 소개 한 줄 */
  topic: string;
  itemA: DfEyeItem;
  itemB: DfEyeItem;
  /** AI가 만든 쪽 */
  aiIs: DfSide;
  /** 정답 공개 문구 — 이유는 설명하지 않는다 ("사실, 알 수 없어요") */
  revealNote: string;
}

export interface DfEyeTest {
  title: string;
  prompt: string;
  hint: string;
  rounds: DfEyeRound[];
}

/** 눈 시험이 끝난 뒤 중간 결과 문구 */
export interface DfMidResult {
  title: string;
  scoreLabel: string;
  coinLine: string;
  lesson: string;
  classActivity: string;
  chiefLine: string;
  nextLabel: string;
}

/* ---------- 2부 · 검증 수사 ---------- */

export interface DfTool {
  id: DfToolId;
  emoji: string;
  name: string;
  desc: string;
}

export interface DfCase {
  id: string;
  emoji: string;
  /** 충격적인 게시물 제목 */
  headline: string;
  /** 게시물 내용 설명 */
  contentDesc: string;
  /** 도구별 조사 결과 카드 문구 */
  toolResults: Record<DfToolId, string>;
  answer: "real" | "fake";
  /** 결론 후 해설 */
  explanation: string;
  /** 사기 예방 등 특별 경고 (있을 때만) */
  dangerNote?: string;
}

/** 2부 점수 규칙 */
export interface DfCaseRules {
  /** 결론 정답 점수 */
  conclusionPoints: number;
  /** 절차 보상 점수 (도구를 minToolsForBonus개 이상 쓰고 결론) */
  processBonus: number;
  minToolsForBonus: number;
}

/* ---------- 결과 화면 ---------- */

/** 수사대 등급 — min 점수 이상이면 해당 등급 (높은 것부터 검사) */
export interface DfGrade {
  min: number;
  emoji: string;
  name: string;
  desc: string;
}

/** 결과 화면의 4단계 검증 수칙 카드 */
export interface DfRule {
  emoji: string;
  title: string;
  desc: string;
}

export interface DfResultText {
  title: string;
  compareTitle: string;
  eyeBarLabel: string;
  verifyBarLabel: string;
  compareNote: string;
  gradeLabel: string;
  rulesTitle: string;
  worksheetNote: string;
  finalTitle: string;
  finalMessage: string;
  retryButton: string;
  homeButton: string;
}

/** 화면 곳곳에 쓰이는 문구 (교사 편집 가능) */
export interface DfLabels {
  part1: string;
  part2: string;
  roundLabel: string;
  caseLabel: string;
  scoreSuffix: string;
  correctPick: string;
  wrongPick: string;
  nextButton: string;
  toMidButton: string;
  aiBadge: string;
  humanBadge: string;
  toolboxTitle: string;
  toolHint: string;
  evidenceTitle: string;
  concludePrompt: string;
  conclusionReal: string;
  conclusionFake: string;
  conclusionUnsure: string;
  noToolWarning: string;
  unsureFeedback: string;
  verdictCorrect: string;
  verdictWrong: string;
  bonusNote: string;
  dangerTitle: string;
  nextCaseButton: string;
  resultButton: string;
  loading: string;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface DfContent {
  $설명?: string;
  intro: DfIntro;
  eyeTest: DfEyeTest;
  midResult: DfMidResult;
  tools: DfTool[];
  cases: DfCase[];
  caseRules: DfCaseRules;
  grades: DfGrade[];
  verificationRules: DfRule[];
  result: DfResultText;
  labels: DfLabels;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

export type DfPhase = "intro" | "eye" | "mid" | "case" | "result";

/** 눈 시험 한 라운드의 판정 */
export interface DfEyeVerdict {
  pick: DfSide;
  correct: boolean;
}

/** 사건 결론 선택지 */
export type DfConclusion = "real" | "fake" | "unsure";

/** 한 사건의 판정 결과 */
export interface DfCaseVerdict {
  conclusion: DfConclusion;
  correct: boolean;
  /** 결론 전까지 사용한 도구 수 */
  toolCount: number;
  /** 절차 보상을 받았는지 */
  gotBonus: boolean;
  /** 이 사건에서 얻은 점수 */
  points: number;
}

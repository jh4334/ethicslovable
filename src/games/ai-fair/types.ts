/**
 * 모두의 AI — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/ai-fair.json 과 1:1 대응한다.
 * (배포본에서는 data/ai-fair.json 을 고치면 게임 내용이 바뀐다.)
 */

/** 누리봇 반응 종류 */
export type BotResult = "good" | "struggle" | "fail";

/** 공정 시험에 등장하는 사용자 한 명 (교사 편집 가능) */
export interface AfUser {
  id: string;
  emoji: string;
  /** 누구인지 — 존중하는 표현으로 */
  who: string;
  /** 누리봇에게 부탁한 말 */
  request: string;
  /** 누리봇이 실제로 어떻게 반응했는가 */
  botResult: BotResult;
  /** 누리봇 말풍선 대사 */
  botLine: string;
  /** 이 상황이 공평한가 (true면 정답은 '공평해요') */
  isFair: boolean;
  /** 불공평할 때의 원인 — causes[].id 중 하나 (공평하면 "") */
  causeId: string;
  /** 검사 결과로 보여 주는 설명 (AI 설계의 문제로 프레이밍) */
  explain: string;
}

/** 편향·차별 유형 도감 카드 한 장 */
export interface AfCause {
  id: string;
  emoji: string;
  name: string;
  desc: string;
}

/** 고치기 선택지 한 개 */
export interface AfChoice {
  text: string;
  isGood: boolean;
  feedback: string;
}

/** 공정하게 고치기 문제 한 개 */
export interface AfFix {
  id: string;
  emoji: string;
  problem: string;
  choices: AfChoice[];
}

/** 모두를 위한 AI 원칙 카드 */
export interface AfRule {
  emoji: string;
  title: string;
  text: string;
}

/** 검사관 등급 (min 큰 순서로 먼저 맞는 등급을 쓴다) */
export interface AfGrade {
  min: number;
  emoji: string;
  name: string;
  desc: string;
}

export interface AfMeta {
  gameTitle: string;
  role: string;
  tagline: string;
  introParagraphs: string[];
  startButton: string;
}

/** 화면 문구 모음 */
export interface AfUi {
  inspectTitle: string;
  inspectGuide: string;
  requestLabel: string;
  resultLabel: string;
  resultGood: string;
  resultStruggle: string;
  resultFail: string;
  fairQuestion: string;
  answerFair: string;
  answerUnfair: string;
  judgeCorrect: string;
  judgeWrong: string;
  causeQuestion: string;
  causeCorrect: string;
  causeWrong: string;
  explainTitle: string;
  nextUserButton: string;
  toFixButton: string;
  fixTitle: string;
  fixGuide: string;
  problemLabel: string;
  badgeEarned: string;
  tryAgainNote: string;
  nextFixButton: string;
  toResultButton: string;
  badgesLabel: string;
  resultTitle: string;
  scoreLabel: string;
  gradeLabel: string;
  codexTitle: string;
  codexEmpty: string;
  rulesTitle: string;
  finishNote: string;
  mapButton: string;
  restartButton: string;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface AfContent {
  /** 교사용 편집 안내 — 게임에서는 쓰지 않는다 */
  $설명?: string[];
  meta: AfMeta;
  users: AfUser[];
  causes: AfCause[];
  fixes: AfFix[];
  fairnessRules: AfRule[];
  grades: AfGrade[];
  ui: AfUi;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

/** 사용자 한 명에 대한 검사 결과 */
export interface InspectResult {
  userId: string;
  /** 플레이어가 '공평'이라고 답했는가 */
  judgedFair: boolean;
  /** 판단이 정답과 맞았는가 */
  judgeCorrect: boolean;
  /** 고른 원인 카드 id (불공평 판단 시에만) */
  causePicked: string | null;
  /** 원인이 맞았는가 */
  causeCorrect: boolean;
}

/** 고치기 한 문제 결과 */
export interface FixResult {
  fixId: string;
  /** 처음 고른 선택이 바로 정답이었는가 */
  firstTrySolved: boolean;
}

export type AfPhase = "intro" | "inspect" | "fix" | "result";

/**
 * 15차시 · 누가 만들었게? — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/ai-copyright.json 과 1:1 대응한다.
 * (배포본에서는 data/ai-copyright.json 을 고치면 게임 내용이 바뀐다.)
 * 핵심 가치: 책임 (충북형 AI 윤리 가이드라인 PART2 저작권).
 */

/** 1부 상황 카드의 세 가지 판단 — 괜찮아요 / 안 돼요 / 밝히면 돼요 */
export type AcVerdictKey = "ok" | "no" | "disclose";

/** 책임 원칙 도감의 원칙 한 장 */
export interface AcPrinciple {
  id: string;
  emoji: string;
  name: string;
  desc: string;
}

/** 1부 상황 카드의 선택지 한 개 */
export interface AcChoice {
  key: AcVerdictKey;
  label: string;
  text: string;
}

/** 1부 · 이거 써도 될까? — 상황 카드 한 개 */
export interface AcRound1 {
  id: string;
  emoji: string;
  situation: string;
  choices: AcChoice[];
  correct: AcVerdictKey;
  /** 이 상황을 맞히면 도감에 모으는 원칙 id */
  focusPrincipleId: string;
  explain: string;
}

/** 2부 상황의 선택지 한 개 */
export interface AcMakeRightChoice {
  text: string;
  isGood: boolean;
  feedback: string;
}

/** 2부 · 바르게 만들기 — 상황 한 개 */
export interface AcMakeRight {
  id: string;
  emoji: string;
  situation: string;
  choices: AcMakeRightChoice[];
}

/** AI 창작 3약속 카드 */
export interface AcPromise {
  emoji: string;
  title: string;
  desc: string;
}

/** 심판 등급 (min 점수 이상일 때 적용) */
export interface AcGrade {
  min: number;
  emoji: string;
  title: string;
  desc: string;
}

export interface AcIntro {
  title: string;
  role: string;
  greeting: string;
  mission: string;
  tip: string;
  startLabel: string;
}

export interface AcRules {
  pointsPerCorrect: number;
}

/** 화면 문구 모음 */
export interface AcLabels {
  part1Name: string;
  part2Name: string;
  situationLabel: string;
  questionTitle: string;
  part1Hint: string;
  correctBanner: string;
  wrongBanner: string;
  answerLabel: string;
  newPrincipleTitle: string;
  principleBookTitle: string;
  principleBookHint: string;
  lockedPrincipleLabel: string;
  part2Intro: string;
  part2Hint: string;
  part2GoodBanner: string;
  part2BadBanner: string;
  nextButton: string;
  toPart2Button: string;
  resultButton: string;
  resultTitle: string;
  scoreLabel: string;
  correctCountLabel: string;
  promisesTitle: string;
  promisesHint: string;
  retryButton: string;
  homeButton: string;
  part1RoundLabel: string;
  part2RoundLabel: string;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface AcContent {
  intro: AcIntro;
  principles: AcPrinciple[];
  round1: AcRound1[];
  makeRight: AcMakeRight[];
  promises: AcPromise[];
  grades: AcGrade[];
  rules: AcRules;
  labels: AcLabels;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

export type Phase = "start" | "part1" | "part2" | "result";

/** 1부 한 상황의 판정 결과 */
export interface AcRound1Verdict {
  correct: boolean;
  pickedKey: AcVerdictKey;
}

/** 2부 한 상황에서의 선택 결과 */
export interface AcMakeRightPick {
  choiceIndex: number;
  isGood: boolean;
}

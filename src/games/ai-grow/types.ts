/**
 * 16차시 · AI와 함께 크는 나 — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/ai-grow.json 과 1:1 대응한다.
 * (배포본에서는 data/ai-grow.json 을 고치면 게임 내용이 바뀐다.)
 */

/** 시작 화면 문구 */
export interface AgIntro {
  badge: string;
  title: string;
  story: string;
  mission: string;
  tip: string;
  startLabel: string;
}

/** 1부 학습 상황의 선택지 하나 */
export interface AgChoice {
  text: string;
  /** '나를 키우는 선택'인지 — true면 성장 씨앗을 얻는다 */
  isGrowth: boolean;
  /** 선택 후 보여 줄 해설 — '왜 나를 키우는(못 키우는)지' */
  feedback: string;
}

/** 1부 학습 상황 카드 하나 */
export interface AgSituation {
  id: string;
  emoji: string;
  context: string;
  /** 2~3개. 순서는 콘텐츠 그대로(섞지 않음) — 균형 잡힌 해설을 위해 */
  choices: AgChoice[];
}

/** 2부 · AI가 잘하는 것 vs 나만 할 수 있는 것 분류 활동 */
export interface AgHumanVsAi {
  activityTitle: string;
  activityIntro: string;
  prompt: string;
  aiBucketLabel: string;
  aiBucketEmoji: string;
  humanBucketLabel: string;
  humanBucketEmoji: string;
  aiCan: string[];
  onlyHuman: string[];
  correctFeedback: string;
  wrongFeedback: string;
  summary: string;
}

/** 성장 씨앗 수 기준 등급 */
export interface AgGrade {
  /** 성장 씨앗 수가 이 값 이상일 때 적용 */
  min: number;
  emoji: string;
  title: string;
  desc: string;
}

/** 마무리(다짐 카드·수료) 문구 */
export interface AgFinale {
  resultTitle: string;
  seedSummary: string;
  promiseTitle: string;
  promiseGuide: string;
  cardName: string;
  graduationTitle: string;
  graduationMessage: string;
  retryButton: string;
  homeButton: string;
}

/** 화면 곳곳의 짧은 문구 */
export interface AgLabels {
  situationLabel: string;
  growthTag: string;
  notGrowthTag: string;
  nextSituation: string;
  toSort: string;
  cardIndex: string;
  sortNext: string;
  toResult: string;
  seedGot: string;
  seedMissed: string;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface AgContent {
  $설명?: string;
  intro: AgIntro;
  seedLabel: string;
  situations: AgSituation[];
  humanVsAi: AgHumanVsAi;
  /** 결과 카드에 늘 함께 보이는 3가지 약속 (베끼지 않기·확인하기·나답게) */
  promises: string[];
  grades: AgGrade[];
  finale: AgFinale;
  labels: AgLabels;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

export type Phase = "start" | "situations" | "sort" | "finale";

/** 상황 카드 내부 단계: 선택 전 → 선택 후 해설 */
export type SituationStage = "choosing" | "feedback";

/** 분류 활동에서 섞어 낸 카드 한 장 */
export interface AgSortCard {
  text: string;
  /** true면 '나만 할 수 있는 것', false면 'AI가 잘하는 것' */
  isHumanOnly: boolean;
}

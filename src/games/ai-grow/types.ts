/**
 * 16차시 · AI와 함께 크는 나 — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/ai-grow.json 과 1:1 대응한다.
 * (배포본에서는 data/ai-grow.json 을 고치면 게임 내용이 바뀐다.)
 *
 * 핵심 규칙: '지식 카드' 보유 여부가 ② 좋은 질문 열림 / ③ 오류 발견 가능 여부 /
 * ④ 발전 선택지 열림 / 결말 되물음에 답 가능 여부를 결정한다.
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

/** 지식 카드에 딸린 간단 확인 퀴즈 (선택) */
export interface AgQuiz {
  q: string;
  options: string[];
  answerIndex: number;
  explain: string;
}

/** ① 배우기 단계에서 얻는 지식 카드 하나 */
export interface AgKnowledgeCard {
  id: string;
  icon: string;
  title: string;
  fact: string;
  quiz?: AgQuiz;
}

/** ② 좋은 질문 단계의 질문 선택지 하나 */
export interface AgQuestion {
  id: string;
  text: string;
  /** 지식을 활용한 구체적(쓸모 있는) 질문이면 true */
  isGood: boolean;
  /** 이 질문을 열려면 필요한 지식 카드 id (없으면 늘 열려 있음 = 막연한 질문) */
  requiresKnowledgeId?: string;
  /** 이 질문을 고르면 나오는 누리봇 답 id */
  botAnswerId: string;
  /** 질문을 고른 뒤 보여 줄 해설 */
  feedback: string;
}

/** ③ AI 답 검토 단계에서 검토할 누리봇 답 하나 */
export interface AgBotAnswer {
  id: string;
  /** 문장들을 줄바꿈(\n)으로 이어 붙인 답 본문 */
  text: string;
  /** text 안의 '틀린 문장' — text의 한 줄과 정확히 일치한다 */
  errorSpan: string;
  /** 오류를 바로잡아 주는 해설 */
  errorFixExplain: string;
  /** 이 오류를 '보려면(잡으려면)' 필요한 지식 카드 id */
  requiresKnowledgeId: string;
}

/** ④ 발전시키기 단계의 선택지 하나 */
export interface AgDevelopChoice {
  text: string;
  /** 이 선택지를 열려면 필요한 지식 카드 id (없으면 늘 열림) */
  requiresKnowledgeId?: string;
  /** 지식을 살린 '가장 나다운 마무리'면 true */
  isBest: boolean;
  feedback: string;
}

export interface AgDevelop {
  prompt: string;
  choices: AgDevelopChoice[];
}

/** 결말 되물음 장치 */
export interface AgRecall {
  /** 되물음에 답하려면 필요한 지식 카드 id */
  requiresKnowledgeId: string;
  botQuestion: string;
  /** 지식이 있을 때 플레이어가 답하는 말 */
  canAnswer: string;
  /** 지식이 없을 때 (답이 막힘) */
  cannotAnswer: string;
}

/** 미션 하나 = 한 분야의 4단계 과제 */
export interface AgMission {
  id: string;
  field: string;
  emoji: string;
  title: string;
  story: string;
  knowledgeCards: AgKnowledgeCard[];
  questions: AgQuestion[];
  botAnswers: AgBotAnswer[];
  develop: AgDevelop;
  recall: AgRecall;
}

/** 성장 등급 (성장 점수 기준) */
export interface AgGrade {
  /** 성장 점수가 이 값 이상일 때 적용 */
  min: number;
  emoji: string;
  title: string;
  desc: string;
}

/** 마무리(되물음·다짐·수료) 문구 */
export interface AgFinale {
  recallTitle: string;
  recallIntro: string;
  recallCanTag: string;
  recallCannotTag: string;
  recallInsight: string;
  resultTitle: string;
  skillSummary: string;
  errorSummary: string;
  /** 결과 화면의 학습지 연계 안내 한 줄 */
  worksheetNote: string;
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
  missionLabel: string;
  fieldLabel: string;
  stepNames: string[];
  stepHint: string;
  learnIntro: string;
  learnCardOf: string;
  learnBtn: string;
  skipBtn: string;
  quizPrompt: string;
  quizCorrect: string;
  quizWrong: string;
  /** 확인 문제를 틀렸을 때 재도전 안내 */
  quizRetryHint: string;
  learnedTag: string;
  skippedTag: string;
  learnNext: string;
  toQuestion: string;
  questionPrompt: string;
  lockedHint: string;
  goodQuestionTag: string;
  vagueQuestionTag: string;
  toReview: string;
  reviewPrompt: string;
  canFindHint: string;
  cannotFindHint: string;
  acceptBtn: string;
  wrongPick: string;
  /** 오답 문장을 한 번 짚은 뒤 마지막 기회 경고 */
  wrongPickWarn: string;
  caughtTag: string;
  missedTag: string;
  missedReveal: string;
  toDevelop: string;
  developIntro: string;
  bestTag: string;
  okTag: string;
  missionResultTitle: string;
  skillGauge: string;
  completionGauge: string;
  cardUnit: string;
  completionFull: string;
  completionThin: string;
  toNextMission: string;
  toResult: string;
  retryButton: string;
  homeButton: string;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface AgContent {
  $설명?: string;
  intro: AgIntro;
  missions: AgMission[];
  finale: AgFinale;
  /** 결과 카드에 늘 함께 보이는 3가지 약속 (배우고 쓰기·확인하기·나답게 발전) */
  promises: string[];
  grades: AgGrade[];
  labels: AgLabels;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

export type Phase = "start" | "mission" | "finale";

/** 미션 안의 단계 */
export type MissionStep = "learn" | "question" | "review" | "develop" | "result";

/** ① 배우기 단계의 카드별 진행 상태 */
export type LearnStage = "choose" | "quiz" | "done";

/** ② 좋은 질문 / ④ 발전 단계 공통 진행 상태 */
export type PickStage = "choose" | "feedback";

/** ③ AI 답 검토 단계 진행 상태 */
export type ReviewStage = "inspect" | "result";

/** 한 미션의 플레이 기록 */
export interface MissionProgress {
  /** 얻은 지식 카드 id 목록 */
  acquired: string[];
  /** 퀴즈를 맞힌 수 (실력 참고용) */
  quizCorrect: number;
  /** 고른 질문 id */
  questionId: string | null;
  /** 오류를 잡을 수 있었는지 (해당 지식 보유) */
  errorCatchable: boolean;
  /** 오류를 잡았는지 — 그대로 받아들였거나 못 잡았으면 false */
  errorCaught: boolean;
  /** 검토가 끝났는지 */
  reviewed: boolean;
  /** 고른 발전 선택지 index */
  developIndex: number | null;
  /** 고른 발전이 '가장 나다운 마무리'였는지 */
  developBest: boolean;
}

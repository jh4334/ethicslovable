/**
 * 데이터 편식쟁이 AI — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/data-bias.json 과 1:1 대응한다.
 * (배포본에서는 data/data-bias.json 을 고치면 게임 내용이 바뀐다.)
 */

/** 훈련 데이터 카드 한 장 (교사 편집 가능) */
export interface DbTrainingCard {
  id: string;
  emoji: string;
  label: string;
  /** 동물 종 이름 (예: 강아지/고양이/새) */
  species: string;
  /** 색·크기 특징 태그 — 화면에는 숨겨지고 판정에만 쓰인다 */
  variantTags: string[];
}

/** 시험 문제 카드 한 장 */
export interface DbTestCard {
  id: string;
  emoji: string;
  label: string;
  species: string;
  /** 정답 조건이 되는 특징 태그 — trainingCards의 variantTags에 존재해야 한다 */
  requiredVariant: string;
  /** 틀렸을 때 보여 주는 '왜 틀렸을까?' 설명 */
  explanationWhenWrong: string;
}

export interface DbMeta {
  gameTitle: string;
  labName: string;
  tagline: string;
  introParagraphs: string[];
  startButton: string;
}

/** 아기봇 대사 모음 — {이름}·{개수} 자리는 코드가 채운다 */
export interface DbBabyBot {
  name: string;
  hungryLine: string;
  pickingLine: string;
  readyLine: string;
  eatingLine: string;
  thinkingLine: string;
  correctTemplates: string[];
  wrongGuessTemplates: string[];
  confusedLines: string[];
}

export interface DbRules {
  /** 한 라운드에 먹일 데이터 수 (기본 8) */
  pickCount: number;
}

export interface DbRoundTexts {
  trainTitle: string;
  trainGuide: string;
  round1Notice: string;
  round2Notice: string;
  feedButton: string;
  testTitle: string;
  testGuide: string;
  testQuestion: string;
  nextButton: string;
  seeResultButton: string;
  correctBadge: string;
  wrongBadge: string;
  answerLabel: string;
  whyWrongTitle: string;
  missingDataLabel: string;
}

export interface DbResultTexts {
  title: string;
  accuracyLabel: string;
  perfectLine: string;
  goodLine: string;
  badLine: string;
  wrongListTitle: string;
  allCorrectNote: string;
  toRound2Button: string;
  toRound2Note: string;
  toReflectionButton: string;
  compareTitle: string;
  compareImproved: string;
  compareBothPerfect: string;
  compareSame: string;
  compareWorse: string;
}

export interface DbReflectionBeat {
  emoji: string;
  title: string;
  text: string;
}

export interface DbReflection {
  title: string;
  beats: DbReflectionBeat[];
  nextButton: string;
  summaryTitle: string;
  finishNote: string;
  mapButton: string;
  restartButton: string;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface DbContent {
  /** 교사용 편집 안내 — 게임에서는 쓰지 않는다 */
  $설명?: string[];
  meta: DbMeta;
  rules: DbRules;
  babyBot: DbBabyBot;
  trainingCards: DbTrainingCard[];
  round1TestCards: DbTestCard[];
  round2TestCards: DbTestCard[];
  rounds: DbRoundTexts;
  results: DbResultTexts;
  reflection: DbReflection;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

/** 시험 카드 한 장에 대한 아기봇의 판정 결과 */
export interface Judgement {
  correct: boolean;
  /** 훈련 데이터에 같은 종이 있었는가 */
  hasSpecies: boolean;
  /** 훈련 데이터에 requiredVariant 특징이 있었는가 */
  hasVariant: boolean;
  /** 아기봇이 내놓은 답 (정답 종 이름 / 엉뚱한 종 이름 / "모르겠어요") */
  botAnswer: string;
  /** 아기봇 말풍선 대사 */
  botLine: string;
  /** 못 먹어 본 데이터 목록 (틀린 원인) */
  missing: string[];
}

export interface JudgedTest {
  card: DbTestCard;
  judgement: Judgement;
}

export interface RoundResult {
  round: 1 | 2;
  correctCount: number;
  total: number;
  /** 0~100 정수 */
  accuracy: number;
  judged: JudgedTest[];
}

export type DbPhase = "intro" | "train" | "test" | "roundResult" | "reflection";

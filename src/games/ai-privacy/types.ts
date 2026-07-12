/**
 * 13차시 · 누리봇에게 말해도 될까? — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/ai-privacy.json 과 1:1 대응한다.
 * (배포본에서는 data/ai-privacy.json 을 고치면 게임 내용이 바뀐다.)
 * 핵심 가치: 안전 — 생성형 AI(누리봇)에게 개인정보·비밀을 입력하지 않기.
 */

/** 위험 정보 도감의 한 종류 (개인정보 유형) */
export interface ApDangerType {
  id: string;
  emoji: string;
  name: string;
  desc: string;
}

/** 1부 — 친구가 누리봇에게 보내려는 메시지 한 개 */
export interface ApRound {
  id: string;
  /** 메시지를 쓰려는 친구 이름 */
  sender: string;
  /** 친구 아바타 이모지 (선택) */
  senderEmoji?: string;
  /** 누리봇에게 보내려는 메시지 본문 */
  message: string;
  /** 사진 메시지 — 이모지 콜라주로 표현 (선택) */
  photo?: string;
  /** true=보내도 안전 / false=멈춰야 함 */
  safe: boolean;
  /** 위험할 때 어떤 개인정보 유형인지 (dangerTypes의 id) */
  dangerTypeId?: string;
  /** 메시지에서 개인정보에 해당하는 부분(빨갛게 강조). 정확히 일치해야 표시됨 */
  highlight?: string;
  /** 판정 해설 — 왜 안전한지 / 왜 위험한지 */
  explain: string;
}

/** 2부 — '실수했어요' 상황의 대응 선택지 */
export interface ApChoice {
  text: string;
  /** true = 올바른 대응 */
  isGood: boolean;
  feedback: string;
}

/** 2부 — 실수 상황 하나 */
export interface ApMistake {
  id: string;
  situation: string;
  /** 3개 — 그중 하나만 isGood */
  choices: ApChoice[];
}

/** 시작 화면 문구 */
export interface ApIntro {
  badge: string;
  title: string;
  botName: string;
  story: string;
  mission: string;
  principleNote: string;
  tip: string;
  startLabel: string;
}

/** '말해도 돼요 vs 말하면 안 돼요' 정리 카드 */
export interface ApCompare {
  okTitle: string;
  okItems: string[];
  noTitle: string;
  noItems: string[];
}

/** 안전 점수(맞힌 수) 기준 등급 */
export interface ApGrade {
  /** 맞힌 수가 이 값 이상일 때 적용 */
  min: number;
  emoji: string;
  title: string;
  desc: string;
}

/** 화면 곳곳의 짧은 문구 */
export interface ApLabels {
  part1Label: string;
  part2Label: string;
  botStatus: string;
  draftHint: string;
  sendOk: string;
  stop: string;
  correctTitle: string;
  wrongTitle: string;
  safeVerdict: string;
  dangerVerdict: string;
  dexLabel: string;
  collected: string;
  /** 오답으로 이 위험 유형 도감을 못 모았을 때 안내 */
  missedCollect: string;
  /** 1부 절반을 지날 때 응원 한 줄 */
  halfwayLine: string;
  roundLabel: string;
  nextRound: string;
  toPart2: string;
  mistakeChooseHint: string;
  toResult: string;
  nextMistake: string;
  situationLabel: string;
  inputPlaceholder: string;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface ApContent {
  $설명?: string;
  intro: ApIntro;
  dangerTypes: ApDangerType[];
  round1: ApRound[];
  mistakes: ApMistake[];
  safetyRules: string[];
  compare: ApCompare;
  grades: ApGrade[];
  labels: ApLabels;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

export type ApPhase = "start" | "round1" | "mistakes" | "result";

/** 1부/2부 한 문항의 내부 단계: 판단 대기 → 해설 공개 */
export type ApStage = "ask" | "reveal";

/** 1부 판단 — 플레이어가 누른 버튼 */
export type ApVerdict = "send" | "stop";

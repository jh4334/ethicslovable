/**
 * "알고리즘 설계자" 게임 콘텐츠 스키마.
 * 실제 내용(카드·엔딩·성찰 문구)은 src/content/feed-algorithm.json 에 있고,
 * 배포 후에는 data/feed-algorithm.json 을 고치면 재빌드 없이 바뀐다.
 */

export type StatKey = "eng" | "safe" | "profit" | "trust";

/** 네 가지 수치(0~100) */
export type Stats = Record<StatKey, number>;

export interface StatInfo {
  key: StatKey;
  label: string;
  icon: string;
  description: string;
}

/** 카드의 한쪽 선택지: 문구 + 수치 변화 + 결과 메시지 */
export interface ChoiceEffect {
  label: string;
  effects: Stats;
  message: string;
}

export interface DilemmaCard {
  id: number;
  /** 카드가 다루는 미디어 리터러시 개념 (카드 상단 태그) */
  concept: string;
  /** 플레이어가 맡는 역할 */
  role: string;
  emoji: string;
  /** 딜레마 상황 설명 */
  text: string;
  /** 오른쪽으로 밀기 = 승인 */
  approve: ChoiceEffect;
  /** 왼쪽으로 밀기 = 거절 */
  reject: ChoiceEffect;
}

/** 수치가 0 이하/100 이상이 되었을 때의 엔딩 (8종) */
export interface GameOverEnding {
  stat: StatKey;
  bound: "low" | "high";
  emoji: string;
  title: string;
  desc: string;
}

export type PlayStyleKey = "profit" | "safety" | "balance";

/** 플레이 성향별 문구: 7일 생존 엔딩 + 결과 리포트 */
export interface PlayStyleInfo {
  label: string;
  emoji: string;
  survivalTitle: string;
  survivalDesc: string;
  report: string;
}

export interface FeedAlgorithmContent {
  meta: {
    maxDays: number;
    startValue: number;
  };
  stats: StatInfo[];
  intro: {
    emoji: string;
    title: string;
    subtitle: string;
    paragraphs: string[];
    warning: string;
    rule: string;
    startButton: string;
  };
  tutorial: {
    leftLabel: string;
    leftDesc: string;
    rightLabel: string;
    rightDesc: string;
    heading: string;
    body: string;
    dismissButton: string;
    hint: string;
  };
  cards: DilemmaCard[];
  gameOverEndings: GameOverEnding[];
  playStyles: Record<PlayStyleKey, PlayStyleInfo>;
  result: {
    survivalHeading: string;
    gameOverHeading: string;
    reportTitle: string;
    logTitle: string;
    continueButton: string;
  };
  reflection: {
    title: string;
    paragraphs: string[];
    rulesTitle: string;
    rules: string[];
    restartButton: string;
  };
}

/** 게임 진행 기록 한 줄 */
export interface GameLogEntry {
  day: number;
  concept: string;
  msg: string;
  type: "YES" | "NO";
}

/** 화면에 보여줄 최종 엔딩 정보 */
export interface EndingInfo {
  emoji: string;
  title: string;
  desc: string;
  survived: boolean;
}

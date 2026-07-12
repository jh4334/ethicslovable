/**
 * 7차시 · 누리봇 사실 검증단 — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/fact-check.json 과 1:1 대응한다.
 * (배포본에서는 data/fact-check.json 을 고치면 게임 내용이 바뀐다.)
 */

/** 누리봇 답변을 이루는 문장 한 개 */
export interface FcSentence {
  /** 화면에 보이는 문장 */
  text: string;
  /** 이 문장이 거짓(환각)이면 true */
  isFalse: boolean;
  /** 거짓임을 밝혀 주는 근거 자료의 key (isFalse가 true일 때) */
  evidenceKey?: string;
}

/** 검증에 쓰는 근거 자료 카드 */
export interface FcEvidence {
  /** 문장과 연결하는 고유 키 */
  key: string;
  /** 자료 출처 (예: 누리백과, 누리마을 소식지) */
  source: string;
  /** 자료 제목 */
  title: string;
  /** 자료 본문 — 사실을 명확히 담는다 */
  text: string;
}

/** 한 라운드 = 마을 사람의 질문 + 누리봇의 답 + 근거 자료 */
export interface FcRound {
  id: string;
  /** 질문한 마을 사람 닉네임 (가상) */
  asker: string;
  /** 마을 사람의 질문 */
  question: string;
  /** 누리봇 답변 문장들 — 거짓 문장이 하나도 없으면 '모두 사실'이 정답 */
  sentences: FcSentence[];
  /** 이 라운드의 근거 자료들 */
  evidence: FcEvidence[];
  /** 판정 후 보여 주는 해설 */
  explanation: string;
  /** 실세계 상식 라운드면 true, 누리마을 세계관 정보면 false */
  isRealWorld?: boolean;
}

/** 게임 소개 문구 */
export interface FcIntro {
  title: string;
  role: string;
  nuribotIntro: string;
  mission: string;
  tip: string;
  startLabel: string;
}

export interface FcRules {
  totalRounds: number;
  pointsPerCorrect: number;
}

/** 검증 요원 등급 */
export interface FcGrade {
  /** 이 점수 이상일 때 적용 */
  min: number;
  emoji: string;
  title: string;
  desc: string;
}

/** 누리봇 반응 문구 모음 */
export interface FcReactions {
  /** 거짓 문장을 정확히 찾았을 때 */
  correct: string[];
  /** '모두 사실' 라운드를 맞혔을 때 */
  correctAllTrue: string[];
  /** 틀렸을 때 */
  wrong: string[];
  /** 사과 문구 */
  apology: string;
}

/** 화면 문구 모음 */
export interface FcLabels {
  openDrawer: string;
  closeDrawer: string;
  drawerTitle: string;
  drawerHint: string;
  allTrueButton: string;
  pickHint: string;
  nextButton: string;
  resultButton: string;
  roundLabel: string;
  realWorldBadge: string;
  villageBadge: string;
  evidenceQuote: string;
  retryButton: string;
  homeButton: string;
  resultTitle: string;
  correctCountLabel: string;
  /** 결과 화면 하단의 학습지 연계 안내 한 줄 */
  worksheetNote: string;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface FcContent {
  intro: FcIntro;
  rules: FcRules;
  rounds: FcRound[];
  grades: FcGrade[];
  resultSummary: string[];
  nuribotReactions: FcReactions;
  labels: FcLabels;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

export type Phase = "start" | "playing" | "result";

/** 한 라운드의 판정 결과 */
export interface RoundVerdict {
  /** 플레이어가 고른 문장 인덱스 (모두 사실을 골랐으면 null) */
  pickedIndex: number | null;
  /** 정답이었는지 */
  correct: boolean;
  /** 실제 거짓 문장 인덱스 (allTrue 라운드면 -1) */
  falseIndex: number;
}

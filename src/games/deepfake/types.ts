/**
 * 딥페이크 탐정단 — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/deepfake.json 과 1:1 대응한다.
 * (배포본에서는 data/deepfake.json 을 고치면 게임 내용이 바뀐다.)
 *
 * 사진(그림)은 svgs.tsx 에 코드로 그려져 있고, JSON 의 svgId 로 골라 쓴다.
 * 각 그림의 "이상한 곳"(anomaly) 위치도 svgs.tsx 의 핫스팟에 정의되어 있다.
 */

/** 게임 소개 문구 */
export interface DfMeta {
  gameTitle: string;
  tagline: string;
  intro: string;
  /** 시작 화면의 놀이 방법 안내 (줄 단위) */
  howTo: string[];
  startButton: string;
}

/** 점수 규칙 */
export interface DfRules {
  /** 진짜/가짜 판별 성공 점수 */
  judgePoints: number;
  /** 단서 찾기 성공 점수 */
  cluePoints: number;
}

/** 화면 곳곳에 쓰이는 문구 (교사 편집 가능) */
export interface DfUi {
  roundLabel: string;
  scoreLabel: string;
  imageTag: string;
  textTag: string;
  judgePrompt: string;
  realButton: string;
  fakeButton: string;
  huntTitle: string;
  huntPromptImage: string;
  huntPromptText: string;
  judgeCorrectFake: string;
  judgeCorrectReal: string;
  judgeWrongFake: string;
  judgeWrongReal: string;
  huntFound: string;
  huntMissed: string;
  clueCollected: string;
  notebookTitle: string;
  explainTitle: string;
  nextButton: string;
  finishButton: string;
}

/** 단서 수첩의 단서 한 종류 (사전 항목) */
export interface DfClue {
  id: string;
  /** 단서 이름 (예: 손가락 개수 오류) */
  name: string;
  /** 어린이용 설명 한 줄 */
  desc: string;
}

/**
 * 가짜 사진 속 이상한 곳 하나.
 * id 는 svgs.tsx 에 정의된 핫스팟 id, clueId 는 찾으면 수첩에 기록되는 단서.
 * (한 사진에 서로 다른 단서 종류가 1~2개 들어갈 수 있어 쌍으로 관리한다.)
 */
export interface DfAnomaly {
  id: string;
  clueId: string;
}

interface DfRoundBase {
  id: string;
  isFake: boolean;
  /** 해설 문구 — 단서 이름을 짚어 주고 배움을 정리한다 */
  explain: string;
}

/** 사진(그림) 사건 */
export interface DfImageRound extends DfRoundBase {
  type: "image";
  /** 사진 위에 붙는 설명 (누가 올렸는지 힌트 포함) */
  caption: string;
  /** svgs.tsx 의 그림 id */
  svgId: string;
  /** 가짜일 때만: 이상한 곳 목록 (1~2개) */
  anomalies?: DfAnomaly[];
}

/** 글(SNS 게시글·뉴스) 사건 */
export interface DfTextRound extends DfRoundBase {
  type: "text";
  title: string;
  /** 문장 단위 — 단서 찾기에서 문장별로 클릭한다 */
  sentences: string[];
  /** 가짜일 때만: 수상한 문장의 번호 (0부터) */
  suspiciousIndex?: number;
  /** 가짜일 때만: 찾으면 기록되는 단서 id */
  clueId?: string;
}

export type DfRound = DfImageRound | DfTextRound;

/** 탐정 등급 — min 점수 이상이면 해당 등급 (높은 것부터 검사) */
export interface DfGrade {
  min: number;
  name: string;
  emoji: string;
  desc: string;
}

/** 결과 화면 문구 */
export interface DfResultText {
  title: string;
  gradeLabel: string;
  judgeStat: string;
  clueStat: string;
  notebookTitle: string;
  /** 못 모은 단서의 이름 자리 표시 (???) */
  lockedName: string;
  lockedDesc: string;
  finalTitle: string;
  finalMessage: string;
  retryButton: string;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface DfContent {
  $설명?: string;
  meta: DfMeta;
  rules: DfRules;
  ui: DfUi;
  clues: DfClue[];
  rounds: DfRound[];
  grades: DfGrade[];
  result: DfResultText;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

export type DfPhase = "intro" | "playing" | "result";

/** 한 사건(라운드)의 진행 단계: 판별 → 단서 찾기 → 해설 */
export type DfStep = "judge" | "hunt" | "explain";

/** 판별 결과 */
export interface DfJudgeResult {
  /** 플레이어가 "가짜"라고 답했는지 */
  saidFake: boolean;
  correct: boolean;
}

/** 단서 찾기 결과 — skipped 는 판별을 틀려 찾기 기회가 없던 경우 */
export type DfHuntResult = "found" | "missed" | "skipped";

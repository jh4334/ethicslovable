/**
 * 11차시 · 검색 결과 탐정 — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/search-detective.json 과 1:1 대응한다.
 * (배포본에서는 data/search-detective.json 을 고치면 게임 내용이 바뀐다.)
 */

/** 라운드 질문 유형 — 유형마다 정답을 내는 방식이 다르다 */
export type SdQuestionType = "find-ads" | "pick-trusted" | "find-sponsor";

/** 검색 결과 유형 */
export type SdResultType = "ad" | "official" | "sponsor" | "qna" | "clickbait";

/** 단서 도감의 단서 한 장 */
export interface SdClue {
  id: string;
  emoji: string;
  name: string;
  desc: string;
}

/** 누리찾기 검색 결과 한 개 */
export interface SdResult {
  id: string;
  type: SdResultType;
  /** 사이트 이름 (가상 — 누리 세계관) */
  site: string;
  /** 파비콘 대신 쓰는 이모지 */
  favicon: string;
  /** 주소풍 경로 (예: care.nuri.example/반려견/먹이안내) */
  pathish: string;
  /** 파란 제목 링크 */
  title: string;
  /** 회색 요약 두 줄 */
  snippet: string;
  /** 작성일 — old-date 단서 결과는 일부러 오래된 날짜 */
  date: string;
  /** 상세 미리보기 본문 (문장 배열 — find-sponsor 라운드에서 탭 대상) */
  detail: string[];
  /** 이 결과에서 발견되는 단서 도감 id 목록 */
  clueIds: string[];
  /** '광고' 칩을 붙일지 (type이 ad면 true) */
  adChip?: boolean;
  /** 쇼핑형 결과의 가격 표시 */
  price?: string;
  /** detail 배열에서 협찬 문구가 있는 인덱스 (type이 sponsor일 때) */
  sponsorTextIndex?: number;
}

/** 한 라운드 = 의뢰인의 검색 미션 한 개 */
export interface SdRound {
  id: string;
  /** 의뢰인(누리마을 주민) 닉네임 */
  client: string;
  clientEmoji: string;
  /** 의뢰인 말풍선 대사 */
  request: string;
  /** 검색창에 타이핑되는 검색어 */
  query: string;
  questionType: SdQuestionType;
  /** 미션 질문 문구 */
  question: string;
  /** 이 라운드를 맞히면 도감에 수집되는 단서 id */
  focusClueId: string;
  results: SdResult[];
  /** 판정 후 해설 */
  explanation: string;
}

export interface SdIntro {
  title: string;
  role: string;
  greeting: string;
  mission: string;
  tip: string;
  startLabel: string;
}

export interface SdRules {
  pointsPerCorrect: number;
}

/** 탐정 등급 (min 점수 이상일 때 적용) */
export interface SdGrade {
  min: number;
  emoji: string;
  title: string;
  desc: string;
}

/** 화면 문구 모음 */
export interface SdLabels {
  roundLabel: string;
  clientLabel: string;
  searchingLabel: string;
  questionTitle: string;
  typeHintFindAds: string;
  typeHintPickTrusted: string;
  typeHintFindSponsor: string;
  adChipLabel: string;
  qnaBadge: string;
  previewButton: string;
  selectAd: string;
  selectedAd: string;
  selectTrusted: string;
  selectedTrusted: string;
  sponsorPickHint: string;
  sponsorConfirm: string;
  detailClose: string;
  submitFindAds: string;
  submitPickTrusted: string;
  sponsorBottomHint: string;
  correctBanner: string;
  wrongBanner: string;
  newClueTitle: string;
  missedClueNote: string;
  markPickedRight: string;
  markMissedTarget: string;
  markPickedWrong: string;
  nextButton: string;
  resultButton: string;
  resultTitle: string;
  scoreLabel: string;
  correctCountLabel: string;
  clueBookTitle: string;
  clueBookHint: string;
  lockedClueLabel: string;
  habitsTitle: string;
  /** 결과 화면 하단의 학습지 연계 안내 한 줄 */
  worksheetNote: string;
  retryButton: string;
  homeButton: string;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface SdContent {
  intro: SdIntro;
  rules: SdRules;
  clues: SdClue[];
  resultTypeLabels: Record<SdResultType, string>;
  rounds: SdRound[];
  grades: SdGrade[];
  habits: string[];
  labels: SdLabels;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

export type Phase = "start" | "playing" | "result";

/** 한 라운드의 판정 결과 */
export interface SdVerdict {
  correct: boolean;
  /** 플레이어가 고른 결과 id 목록 (find-sponsor면 문장을 탭한 결과 1개) */
  pickedIds: string[];
  /** 정답 결과 id 목록 */
  correctIds: string[];
  /** find-sponsor에서 탭한 문장 위치 (그 외 유형은 null) */
  pickedLine: { resultId: string; lineIndex: number } | null;
}

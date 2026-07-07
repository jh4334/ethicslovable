/**
 * 내 데이터의 여행 (8차시) — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/data-trail.json 과 1:1 대응한다.
 * (배포본에서는 data/data-trail.json 을 고치면 게임 내용이 바뀐다.)
 *
 * 중요: 이 게임의 "데이터 수집"은 페이지 안 메모리에서만 흉내 내는 것으로,
 * 행동 기록은 localStorage 등 어디에도 저장하지 않는다.
 */

/* ---------- 콘텐츠 JSON 스키마 ---------- */

/** 게임 소개·파트 안내 문구 */
export interface DtMeta {
  appName: string;
  roleName: string;
  introTitle: string;
  introTagline: string;
  introBody: string[];
  /** "이 게임 안에서만 일어나는 흉내예요" 안내 — 반드시 인트로에 노출 */
  simulationNotice: string;
  partLabels: { step: string; title: string; line: string }[];
  startButton: string;
}

/** 피드 게시물 한 장 */
export interface DtPost {
  id: string;
  emoji: string;
  title: string;
  category: string;
  /** 프로필·광고 매칭에 쓰이는 태그 (profile.templates / adPool의 tag와 맞춰야 함) */
  tags: string[];
  /** 열어보기를 눌렀을 때 보이는 본문 한 줄 */
  detail: string;
}

/** 검색창에 제시되는 검색 칩 */
export interface DtSearchChip {
  label: string;
  tags: string[];
}

export interface DtFeedConfig {
  instruction: string;
  /** 파트 A에서 남겨야 하는 데이터 조각(행동) 수 */
  actionGoal: number;
  counterLabel: string;
  goalBanner: string;
  stopButton: string;
  searchChips: DtSearchChip[];
  posts: DtPost[];
}

/** 여행 지도 정거장(수집→저장→분석→프로필→맞춤 광고) */
export interface DtStation {
  id: "collect" | "store" | "analyze" | "profile" | "ads";
  emoji: string;
  title: string;
  explanation: string;
}

export interface DtJourneyText {
  title: string;
  subtitle: string;
  nextButton: string;
  doneButton: string;
}

export interface DtProfileConfig {
  cardTitle: string;
  topLabel: string;
  /** "이건 진짜 내가 아니라 데이터로 만든 그림자예요" 문구 */
  shadowNote: string;
  /** 2위 태그 문구 템플릿 — {태그} 치환 */
  secondaryLine: string;
  /** 태그 → 추측 문구. "default"는 매칭 실패 시 사용 */
  templates: Record<string, string>;
}

export interface DtAdSection {
  question: string;
  revealButton: string;
  /** 광고 이유 템플릿 — {태그}·{횟수} 치환 */
  reasonTemplate: string;
  /** 태그가 안 맞는 채움 광고에 쓰는 이유 문구 */
  genericReason: string;
}

/** 광고 풀의 광고 한 장 */
export interface DtAd {
  /** 매칭 태그. 낚시 광고는 "*" */
  tag: string;
  emoji: string;
  title: string;
  line: string;
  /** true면 낚시 광고(무료 선물) — 항상 1장 포함되어 파트 C와 연결 */
  bait?: boolean;
  /** 낚시 광고 전용 이유 문구 */
  baitReason?: string;
}

export interface DtChoice {
  text: string;
  isGood: boolean;
  feedback: string;
}

export interface DtScenario {
  id: string;
  emoji: string;
  situation: string;
  choices: DtChoice[];
}

export interface DtProtectConfig {
  title: string;
  subtitle: string;
  shieldLabel: string;
  nextButton: string;
  finishButton: string;
  scenarios: DtScenario[];
}

export interface DtResultText {
  title: string;
  shieldTitle: string;
  /** 방패 수 구간별 문구 — min 이상이면 적용(내림차순 확인) */
  shieldMessages: { min: number; text: string }[];
  profileRevisit: string;
  coreMessage: string;
  /** 학습 기록 요약 — {개수} 치환 */
  summaryTemplate: string;
  restartButton: string;
}

/** data-trail.json 전체 구조 */
export interface DtContent {
  meta: DtMeta;
  feed: DtFeedConfig;
  stations: DtStation[];
  journey: DtJourneyText;
  profile: DtProfileConfig;
  adSection: DtAdSection;
  adPool: DtAd[];
  protect: DtProtectConfig;
  result: DtResultText;
}

/* ---------- 게임 실행 중에만 쓰는 상태 타입 ---------- */

export type DtPhase = "intro" | "feed" | "journey" | "protect" | "result";

export type DtActionKind = "like" | "open" | "search" | "comment" | "dm";

/** 파트 A에서 남긴 행동 1건 — 메모리에만 존재 */
export interface DtAction {
  kind: DtActionKind;
  /** 좋아요·댓글·DM·열어본 게시물 제목 또는 검색어 */
  target: string;
  tags: string[];
  /** 피드 시작 후 경과 초 */
  atSec: number;
}

export interface DtTagCount {
  tag: string;
  count: number;
}

/** 프로필 카드에 그릴 추측 정보 */
export interface DtProfileGuess {
  /** 관심사 TOP2 (행동이 단조로우면 1개일 수도 있음) */
  top: DtTagCount[];
  line: string;
  subLine: string | null;
}

/** 화면에 뿌릴 광고(이유 치환 완료) */
export interface DtPickedAd {
  emoji: string;
  title: string;
  line: string;
  reason: string;
  isBait: boolean;
}

/** 행동 기록에서 계산한 분석 결과 묶음 */
export interface DtAnalysis {
  ranking: DtTagCount[];
  profile: DtProfileGuess;
  ads: DtPickedAd[];
}

/**
 * 멈출 수 없는 화면 (9차시) — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/short-form.json 과 1:1 대응한다.
 * (배포본에서는 data/short-form.json 을 고치면 게임 내용이 바뀐다.)
 *
 * 핵심 장치: 시간은 실제 시간이 아니라 가상 시간이다 —
 * 영상 1개 시청 = rules.virtualSecondsPerVideo초(기본 30초)로 계산하고,
 * 체험 중에는 시계를 일부러 화면에 보여 주지 않는다(교육 장치).
 */

/* ---------- 콘텐츠 JSON 스키마 ---------- */

export interface SfIntro {
  title: string;
  tagline: string;
  body: string[];
  /** "영상 하나 = 가상 30초" 가상 시계 규칙 안내 — 반드시 인트로에 노출 */
  virtualClockNotice: string;
  /** "딱 5분(가상)만 보기" 약속 문구 */
  promiseLine: string;
  missionSteps: { step: string; title: string; line: string }[];
  startButton: string;
}

export interface SfRules {
  /** 영상 1개 시청 = 가상 몇 초인지 */
  virtualSecondsPerVideo: number;
  /** 인트로에서 약속하는 시청 시간(분) */
  promiseMinutes: number;
  /** 몇 번째 영상을 넘긴 직후 시간 퀴즈가 나오는지 (가상 경과가 정수 분이 되는 값 권장) */
  quizAfterSwipes: number[];
  /** 몇 개를 넘기면 멈추기 챌린지가 시작되는지 (promiseMinutes와 맞춰야 함) */
  stopChallengeAfter: number;
  /** 챌린지 시작 후 몇 개 안에 멈추면 '성공'인지 */
  stopSuccessWindow: number;
  /** 몇 개째에 강제 종료되는지 */
  forceEndAfter: number;
}

/** 피드 영상 한 편 — 이모지 장면 + 그라디언트 배경으로 표현 */
export interface SfVideo {
  id: string;
  emoji: string;
  /** 배경 그라디언트 색상(hue 0~360) */
  bgHue: number;
  account: string;
  caption: string;
  /** 🎵 음악 라벨 (예: "누리숏 인기 사운드 · ○○") */
  sound: string;
  /** 좋아요 수 초깃값 — 댓글·공유 수는 여기서 비율로 계산 */
  likeSeed: number;
  /** true면 '대박 영상' — 더 화려한 연출로 뽑기식(가변) 보상을 체험시킨다 */
  isJackpot?: boolean;
}

export interface SfFeedUi {
  appName: string;
  tabFollowing: string;
  tabForYou: string;
  swipeHint: string;
  nextButton: string;
  jackpotBadge: string;
}

export interface SfTimeQuiz {
  title: string;
  question: string;
  choiceSuffix: string;
  /** {실제} 치환 */
  correctText: string;
  /** {실제} 치환 */
  wrongTemplate: string;
  lesson: string;
  continueButton: string;
}

export interface SfStopChallenge {
  /** 알림 단계별 문구 — 넘길수록 커진다(3단계) */
  banners: { title: string; line: string }[];
  stopButton: string;
  nextButton: string;
  earlyTitle: string;
  earlyLine: string;
  earlyBadge: string;
  lateTitle: string;
  lateLine: string;
  forcedTitle: string;
  forcedLine: string;
  /** 설계 해부 카드에 들어가는 짧은 결과 문구 */
  outcomeShort: Record<SfOutcome, string>;
  /** {영상수}·{시간}·{약속} 치환 */
  watchedTemplate: string;
  reviewButton: string;
}

export interface SfRevealCard {
  id: "infinite" | "variable" | "noclock";
  emoji: string;
  title: string;
  body: string;
  /** 카드별 치환: infinite {영상수} / variable {대박수} / noclock {오차}·{멈춤결과} */
  myDataTemplate: string;
}

export interface SfDesignReveal {
  title: string;
  subtitle: string;
  myDataLabel: string;
  cards: SfRevealCard[];
  nextButton: string;
}

export interface SfGrade {
  /** 점수 하한 — 내림차순으로 첫 매칭 사용 */
  min: number;
  emoji: string;
  name: string;
  line: string;
}

export interface SfTip {
  emoji: string;
  title: string;
  line: string;
}

export interface SfResultText {
  title: string;
  subtitle: string;
  statVideos: string;
  statTime: string;
  statQuiz: string;
  statStop: string;
  /** {오차} 치환 */
  quizErrorTemplate: string;
  stopLabels: Record<SfOutcome, string>;
  coreMessage: string;
  tipsTitle: string;
  tips: SfTip[];
  /** 학습 기록 요약 — {시간}·{멈춤} 치환 */
  summaryTemplate: string;
  summaryStop: Record<SfOutcome, string>;
  restartButton: string;
}

/** short-form.json 전체 구조 */
export interface SfContent {
  intro: SfIntro;
  rules: SfRules;
  feedUi: SfFeedUi;
  videos: SfVideo[];
  timeQuiz: SfTimeQuiz;
  stopChallenge: SfStopChallenge;
  designReveal: SfDesignReveal;
  grades: SfGrade[];
  result: SfResultText;
}

/* ---------- 게임 실행 중에만 쓰는 상태 타입 ---------- */

export type SfPhase = "intro" | "feed" | "ending" | "reveal" | "result";

/** 멈추기 챌린지 결과 */
export type SfOutcome = "early" | "late" | "forced";

/** 진행 중인 시간 퀴즈 상태 */
export interface SfActiveQuiz {
  /** rules.quizAfterSwipes에서의 순번 */
  index: number;
  /** 실제 가상 경과(분) */
  actualMin: number;
  choices: number[];
  picked: number | null;
}

/** 답을 확정한 퀴즈 기록 */
export interface SfQuizResult {
  index: number;
  actualMin: number;
  pickedMin: number;
}

/** 결과·해부 화면에서 쓰는 통계 묶음 */
export interface SfStats {
  /** 끝까지 본(넘긴) 영상 수 */
  watched: number;
  virtualSec: number;
  jackpotSeen: number;
  likeCount: number;
  /** 퀴즈 짐작 오차 합(분) */
  totalErrorMin: number;
  quizCount: number;
}

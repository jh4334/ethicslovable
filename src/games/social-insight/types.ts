/**
 * 추천 요정 훈련소 — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/social-insight.json 과 1:1 대응한다.
 * (배포본에서는 data/social-insight.json 을 고치면 게임 내용이 바뀐다.)
 */

/** 피드 게시물 한 개 (교사 편집 가능) */
export interface SiPost {
  /** 게시물 제목 */
  title: string;
  /** 게시물을 대표하는 이모지 */
  icon: string;
  /** "사진" 또는 "영상" — 카드에 그대로 표시된다 */
  mediaType: string;
  /** 해시태그 문자열 */
  tags: string;
}

/** 관심사 카테고리 — 가상의 계정 하나가 같은 주제 게시물을 올린다 */
export interface SiCategory {
  id: string;
  /** 화면에 보이는 카테고리 이름 (예: 패션/뷰티) */
  label: string;
  /** 가상 계정 별명 (실존 계정·상표 금지) */
  account: string;
  posts: SiPost[];
}

/** 난이도 설정 */
export interface SiDifficulty {
  id: string;
  /** 화면에 보이는 이름 (쉬움/보통/어려움) */
  label: string;
  emoji: string;
  /** 라운드당 제한 시간(초) */
  timeLimit: number;
  /** 보기 개수 */
  choiceCount: number;
  /** 함정(비추천 카테고리)이 등장하기 시작하는 라운드. null이면 함정 없음 */
  trapFromRound: number | null;
  /** 난이도 설명 한 줄 */
  description: string;
}

/** 콤보 칭찬 문구와 보너스 점수 */
export interface SiComboPraise {
  /** 이 콤보 수 이상일 때 적용 */
  minCombo: number;
  /** 추가 점수 */
  bonus: number;
  /** 화면에 뜨는 칭찬 문구 */
  label: string;
}

/** 게임 소개·미션 문구 */
export interface SiMeta {
  gameTitle: string;
  /** 가상 SNS 이름 (누리피드) */
  snsName: string;
  tagline: string;
  intro: string;
  mission: string;
  /** 결과 화면에 보여 주는 배움 정리 문구 */
  resultNote: string;
  /** 결과 화면 하단의 학습지 연계 안내 한 줄 */
  worksheetNote: string;
}

export interface SiRules {
  totalRounds: number;
  /** 정답 기본 점수 */
  basePoints: number;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface SiContent {
  meta: SiMeta;
  rules: SiRules;
  difficulties: SiDifficulty[];
  comboPraise: SiComboPraise[];
  categories: SiCategory[];
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

/** 이번 라운드 문제: 친구가 방금 좋아요 누른 게시물 */
export interface RoundQuestion {
  history: SiPost;
  account: string;
  categoryId: string;
  categoryLabel: string;
  /** 함정 라운드일 때 비추천(싫어하는) 카테고리 이름 */
  dislikeLabel: string | null;
  likes: number;
}

/** 보기 카드 */
export interface Choice extends SiPost {
  account: string;
  categoryId: string;
  isCorrect: boolean;
  isTrap: boolean;
}

export interface Feedback {
  type: "success" | "fail";
  title: string;
  message: string;
}

export interface LeaderboardEntry {
  /** 저장 시 부여하는 고유 id — 내 순위 찾기에 사용 */
  id: string;
  playerName: string;
  score: number;
  maxCombo: number;
  date: string;
}

export type Phase = "start" | "playing" | "result";

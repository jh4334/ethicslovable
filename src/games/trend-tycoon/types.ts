/**
 * "별별TV 알고리즘 연구소" 콘텐츠 스키마 타입.
 *
 * 이야기·문구·영상 데이터는 src/content/trend-tycoon.json 에 있고
 * (배포본에서는 data/trend-tycoon.json 을 고치면 재빌드 없이 반영),
 * 미션의 달성 판정 규칙은 missions.ts 에서 mission.id 로 연결된다.
 */

/** 게임 안내 문구 (헤더·패널·피드 제목) */
export interface IntroContent {
  /** 가상 플랫폼 이름 (예: 별별TV) */
  platformName: string;
  /** 게임 화면 상단 제목 */
  labName: string;
  /** 한 줄 소개 */
  tagline: string;
  /** 슬라이더 패널 제목 */
  controlsTitle: string;
  /** 슬라이더 패널 설명 */
  controlsSubtitle: string;
  /** 추천 피드 제목 */
  feedTitle: string;
  /** 피드 정렬 안내 배지 문구 */
  feedSortLabel: string;
}

/** 미션(레벨) — 판정 규칙은 missions.ts 의 같은 id 에 있다 */
export interface MissionContent {
  /** missions.ts 의 판정 함수와 연결되는 고유 id */
  id: string;
  /** 1~5 */
  level: number;
  title: string;
  /** 미션 이야기·요구 조건 설명 */
  description: string;
  /** 아이들에게 보여 줄 힌트 한 줄 */
  hint: string;
}

/** 추천 피드에 나오는 가상 영상 */
export interface VideoContent {
  id: number;
  title: string;
  /** "학습" | "게임" | "뉴스" | "광고" — 화면에 그대로 표시된다 */
  category: string;
  tags: string[];
  /** 클릭수 */
  clicks: number;
  /** 시청 시간(초) */
  watchTime: number;
  /** 좋아요 수 */
  likes: number;
  /** 자극도 1(잔잔함)~5(매우 자극적) */
  intensity: number;
  /** 썸네일 이모지 */
  emoji: string;
  /**
   * 썸네일 배경색 이름. 사용 가능:
   * blue, indigo, violet, pink, rose, red, orange, amber, yellow,
   * lime, green, teal, cyan, sky, gray, dark
   */
  color: string;
}

/** 최종 등급표 — minScore 가 높은 것부터 검사한다 */
export interface GradeContent {
  /** 등급 글자 (S~D) */
  grade: string;
  /** 이 점수 이상이면 이 등급 */
  minScore: number;
  message: string;
}

/** 클리어 화면 문구 */
export interface ClearContent {
  title: string;
  /** \n 으로 줄을 나눌 수 있다 */
  message: string;
  restartLabel: string;
}

/** trend-tycoon.json 전체 스키마 */
export interface TrendTycoonContent {
  intro: IntroContent;
  missions: MissionContent[];
  videos: VideoContent[];
  grades: GradeContent[];
  clear: ClearContent;
}

/* ---------- 런타임(코드 내부) 타입 ---------- */

/** 알고리즘 가중치 4종 */
export interface Weights {
  clicks: number;
  watchTime: number;
  likes: number;
  intensity: number;
}

/** 추천 점수가 계산된 영상 */
export type RankedVideo = VideoContent & { score: number };

/** 미션 판정 결과 — 진행 상황 문구까지 함께 돌려준다 */
export interface MissionCheckResult {
  complete: boolean;
  /** 미션 패널에 보여 줄 실시간 진행 상황 한 줄 */
  summary: string;
  /** (선택) 관련 상위권 영상 목록 */
  details?: string[];
}

/**
 * 필터버블 탐지기 — 콘텐츠 JSON(src/content/filter-bubble.json) 스키마 타입.
 * 교사가 JSON만 고쳐도 게임 텍스트가 바뀌도록, 이야기 내용은 전부 JSON에 둔다.
 */

/** 콘텐츠 분야(8개). id는 코드가 아이콘·색을 찾는 키라서 고정, 나머지는 자유 수정. */
export interface Category {
  id: string;
  /** 분야 이름 (예: "게임") */
  label: string;
  /** 성향 칭호 수식어 (예: "승부욕 넘치는") */
  adjective: string;
  /** 성향 칭호 별명 (예: "게이머") */
  nickname: string;
}

/** 피드에 나오는 콘텐츠 카드 1장. */
export interface ContentItem {
  id: number;
  /** Category.id 중 하나 */
  category: string;
  title: string;
  /** 자극 정도 1~5 (4 이상이면 강조 표시) */
  intensity: number;
}

/** 성향 칭호 문구 템플릿. {수식어}/{두번째수식어}/{별명}/{분야}/{두번째분야} 토큰이 치환된다. */
export interface PersonaTemplate {
  title: string;
  description: string;
}

export interface PersonaTemplates {
  /** 한 분야를 이 횟수 이상 고르면 focused 유형 */
  focusedMinPicks: number;
  /** 1위 분야 선택이 이 횟수 이하면 explorer 유형 */
  explorerMaxPicks: number;
  /** 한 분야에 극단적으로 몰린 유형 */
  focused: PersonaTemplate;
  /** 골고루 고른 유형 */
  explorer: PersonaTemplate;
  /** 1·2위 분야가 같은(사실상 한 분야) 유형 */
  single: PersonaTemplate;
  /** 1·2위 분야가 다른 복합 유형 */
  dual: PersonaTemplate;
}

/** 필터버블 위험도(0~100점) 구간 문구. minScore 이상이면 적용. */
export interface GaugeLevel {
  id: string;
  minScore: number;
  /** 예: "안전" / "주의" / "위험" */
  label: string;
  description: string;
}

/** 결과 화면 문구 */
export interface FilterBubbleUi {
  /** 결과 화면 하단의 학습지 연계 안내 한 줄 */
  worksheetNote: string;
}

/** filter-bubble.json 전체 구조 */
export interface FilterBubbleContent {
  ui: FilterBubbleUi;
  categories: Category[];
  personas: PersonaTemplates;
  gaugeLevels: GaugeLevel[];
  items: ContentItem[];
}

/** 결과 화면에서 쓰는 성향 정보(치환 완료된 텍스트) */
export interface Persona {
  title: string;
  description: string;
  /** 1위 분야 Category.id */
  type: string;
  /** 2위 분야 Category.id */
  subType: string;
}

/**
 * 뽑기 상자의 비밀 — 콘텐츠·게임 상태 타입.
 * 콘텐츠 스키마는 src/content/gacha-box.json 과 1:1 대응한다.
 * (배포본에서는 data/gacha-box.json 을 고치면 게임 내용이 바뀐다.)
 */

/** 뽑기로 나오는 아이템 하나 */
export interface GbItem {
  name: string;
  emoji: string;
}

/**
 * 등급 정의. key는 common/advanced/rare/legendary 를 쓰지만
 * JSON 편집 호환을 위해 string으로 둔다. probability 4개의 합은 1이어야 한다.
 */
export interface GbRarity {
  key: string;
  label: string;
  /** 등급 색 (hex) — 배지·테두리·히스토그램에 그대로 쓴다 */
  color: string;
  /** 0~1 확률 */
  probability: number;
  pool: GbItem[];
}

export interface GbIntro {
  badge: string;
  title: string;
  tagline: string;
  paragraphs: string[];
  missions: string[];
  startButton: string;
}

export interface GbShop {
  shopName: string;
  itemName: string;
  itemEmoji: string;
  gachaPrice: number;
  directPrice: number;
  coins: number;
  bannerTitle: string;
  bannerSub: string;
  priceLine: string;
  /** 1단계에서 확률 대신 보여 주는 문구 ("획득 확률: ?%") */
  probabilityHidden: string;
  drawButton: string;
  drawingLine: string;
  stopButton: string;
  recordTitle: string;
  recordPullsLabel: string;
  recordSpentLabel: string;
  inventoryTitle: string;
  inventoryEmpty: string;
  noCoinsLine: string;
  coinLabel: string;
}

/** 아쉬움(니어미스) 연출 문구 */
export interface GbNearMiss {
  flashLine: string;
  revealLine: string;
}

export interface GbQuiz {
  question: string;
  choices: string[];
  answerIndex: number;
  correctFeedback: string;
  wrongFeedback: string;
}

export interface GbCalcCard {
  title: string;
  /** {전설확률} {기대횟수} {기대코인} {용돈} {용돈횟수} 자리가 자동으로 채워진다 */
  lines: string[];
  note: string;
}

export interface GbReveal {
  title: string;
  intro: string;
  tableTitle: string;
  myResultTitle: string;
  myResultNote: string;
  calcCard: GbCalcCard;
  quizTitle: string;
  quiz: GbQuiz;
  nextButton: string;
}

export interface GbTrickCard {
  emoji: string;
  title: string;
  text: string;
  /** 내 실제 조사 데이터가 채워지는 줄 — {아쉬움횟수} {쓴코인} {뽑기횟수} 등 */
  dataLine: string;
}

export interface GbTricks {
  title: string;
  intro: string;
  revealButton: string;
  nextButton: string;
  cards: GbTrickCard[];
}

export interface GbScenarioChoice {
  emoji: string;
  label: string;
  feedback: string;
}

export interface GbScenario {
  title: string;
  question: string;
  note: string;
  choices: GbScenarioChoice[];
}

export interface GbChecklist {
  title: string;
  intro: string;
  items: string[];
  nextButton: string;
}

export interface GbGrade {
  /** 이 점수 이상이면 이 등급 (내림차순 정렬 가정) */
  min: number;
  label: string;
  emoji: string;
  comment: string;
}

export interface GbResultTexts {
  title: string;
  spentLabel: string;
  pullsLabel: string;
  nearMissLabel: string;
  quizLabel: string;
  quizPass: string;
  quizFail: string;
  inventoryTitle: string;
  legendaryNote: string;
  noLegendaryNote: string;
  realMoneyNote: string;
  finishNote: string;
  mapButton: string;
  restartButton: string;
}

/** 콘텐츠 JSON 전체 스키마 */
export interface GbContent {
  /** 교사용 편집 안내 — 게임에서는 쓰지 않는다 */
  $설명?: string[];
  intro: GbIntro;
  shop: GbShop;
  rarities: GbRarity[];
  nearMiss: GbNearMiss;
  probabilityReveal: GbReveal;
  tricks: GbTricks;
  scenario: GbScenario;
  checklist: GbChecklist;
  grades: GbGrade[];
  result: GbResultTexts;
}

/* ---------- 아래는 게임 실행 중에만 쓰는 상태 타입 ---------- */

/** 뽑기 1회 기록 */
export interface PullRecord {
  /** 몇 번째 뽑기인지 (1부터) */
  index: number;
  rarityKey: string;
  item: GbItem;
  /** 아쉬움(니어미스) 연출이 붙었는가 — 결과 자체는 불변, 연출만 */
  nearMiss: boolean;
}

export type GbPhase = "intro" | "shop" | "reveal" | "tricks" | "scenario" | "result";

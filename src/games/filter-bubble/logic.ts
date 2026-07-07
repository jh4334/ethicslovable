import type {
  Category,
  ContentItem,
  FilterBubbleContent,
  GaugeLevel,
  Persona,
} from "./types";

/** 분야별 선택 횟수 집계 */
export function countByCategory(history: ContentItem[]): Record<string, number> {
  return history.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * 필터버블 위험도(0~100점).
 * 허핀달-허쉬만 지수(HHI)를 단순화해 선택 집중도를 점수로 만든다.
 * 원작(bubble-lens)과 동일한 계산식.
 */
export function computeRiskScore(history: ContentItem[], categoryCount: number): number {
  const total = history.length;
  if (total === 0 || categoryCount <= 1) return 0;

  const counts = countByCategory(history);
  const sumSquares = Object.values(counts).reduce(
    (acc, count) => acc + Math.pow(count / total, 2),
    0,
  );

  const minSumSquares = 1 / categoryCount;
  const riskScore = Math.round(((sumSquares - minSumSquares) / (1 - minSumSquares)) * 100);
  return Math.max(0, Math.min(100, riskScore));
}

/** 점수에 맞는 위험도 구간(안전/주의/위험) 고르기 — minScore 이하 중 가장 높은 구간 */
export function pickGaugeLevel(levels: GaugeLevel[], score: number): GaugeLevel {
  const sorted = [...levels].sort((a, b) => a.minScore - b.minScore);
  let picked = sorted[0];
  for (const level of sorted) {
    if (score >= level.minScore) picked = level;
  }
  return picked;
}

/** 문자열 안의 토큰을 전부 치환 (ES2020 대상이라 replaceAll 대신 split/join) */
function swapToken(text: string, token: string, value: string): string {
  return text.split(token).join(value);
}

/** 템플릿의 {수식어}/{두번째수식어}/{별명}/{분야}/{두번째분야} 토큰 치환 */
function fillTemplate(template: string, primary: Category, secondary: Category): string {
  let result = template;
  result = swapToken(result, "{두번째수식어}", secondary.adjective);
  result = swapToken(result, "{두번째분야}", secondary.label);
  result = swapToken(result, "{수식어}", primary.adjective);
  result = swapToken(result, "{별명}", primary.nickname);
  result = swapToken(result, "{분야}", primary.label);
  return result;
}

/** 선택 기록으로 성향 칭호 만들기 — 원작 getPersona와 동일한 규칙 */
export function buildPersona(
  history: ContentItem[],
  content: FilterBubbleContent,
): Persona | null {
  if (history.length === 0) return null;

  const counts: Record<string, number> = {};
  content.categories.forEach((c) => (counts[c.id] = 0));
  history.forEach((item) => {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const primaryKey = sorted[0][0];
  const secondaryKey = sorted[1] && sorted[1][1] > 0 ? sorted[1][0] : primaryKey;

  const primary = content.categories.find((c) => c.id === primaryKey);
  const secondary = content.categories.find((c) => c.id === secondaryKey) ?? primary;
  if (!primary || !secondary) return null;

  const { personas } = content;
  let template = personas.dual;
  if (counts[primaryKey] >= personas.focusedMinPicks) {
    template = personas.focused;
  } else if (counts[primaryKey] <= personas.explorerMaxPicks) {
    template = personas.explorer;
  } else if (primaryKey === secondaryKey) {
    template = personas.single;
  }

  return {
    title: fillTemplate(template.title, primary, secondary),
    description: fillTemplate(template.description, primary, secondary),
    type: primaryKey,
    subType: secondaryKey,
  };
}

/**
 * 가짜 조회수(교육용 연출) — 아이템 id로 정해지는 결정적 값이라
 * 다시 렌더링돼도 숫자가 바뀌지 않는다. 10~909(만회) 범위.
 */
export function fakeViewCount(id: number): number {
  let h = (id + 7) * 2654435761;
  h = (h ^ (h >>> 13)) >>> 0;
  return 10 + (h % 900);
}

/**
 * 가짜 재생시간(교육용 연출) — 조회수와 마찬가지로 아이템 id에서
 * 결정되는 값이라 다시 렌더링돼도 바뀌지 않는다. 0:45 ~ 14:59 범위.
 */
export function fakeDuration(id: number): string {
  let h = (id + 3) * 2246822519;
  h = (h ^ (h >>> 15)) >>> 0;
  const totalSeconds = 45 + (h % 855);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

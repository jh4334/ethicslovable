/**
 * 뽑기 상자의 비밀 — 문구 채우기·숫자 표기 도우미.
 * 콘텐츠 JSON의 {기대횟수} {쓴코인} 같은 자리를 실제 값으로 바꾼다.
 */
import type { GbContent } from "./types";

/** "{키}" 자리를 vars 값으로 치환한다. 모르는 키는 그대로 둔다. */
export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(.+?)\}/g, (match, key: string) => vars[key] ?? match);
}

/** 1000 → "1,000" */
export function formatCoins(n: number): string {
  return n.toLocaleString("ko-KR");
}

/** 전설 등급 (rarities의 마지막이 아니라 key로 찾는다) */
export function legendaryOf(content: GbContent) {
  return content.rarities.find((r) => r.key === "legendary") ?? content.rarities[content.rarities.length - 1];
}

/** 기대 뽑기 횟수 = 1 ÷ 확률 (반올림) */
export function expectedPulls(probability: number): number {
  if (probability <= 0) return 0;
  return Math.round(1 / probability);
}

/**
 * 콘텐츠·플레이 기록에서 공용 치환 변수를 만든다.
 * {전설확률} {기대횟수} {기대코인} {용돈} {용돈횟수} {뽑기횟수} {쓴코인} {아쉬움횟수}
 */
export function buildVars(
  content: GbContent,
  play: { pulls: number; spentCoins: number; nearMissCount: number },
): Record<string, string> {
  const legendary = legendaryOf(content);
  const expected = expectedPulls(legendary.probability);
  const { gachaPrice, coins } = content.shop;
  return {
    전설확률: String(Math.round(legendary.probability * 1000) / 10),
    기대횟수: formatCoins(expected),
    기대코인: formatCoins(expected * gachaPrice),
    용돈: formatCoins(coins),
    용돈횟수: formatCoins(Math.floor(coins / gachaPrice)),
    뽑기횟수: formatCoins(play.pulls),
    쓴코인: formatCoins(play.spentCoins),
    아쉬움횟수: formatCoins(play.nearMissCount),
  };
}

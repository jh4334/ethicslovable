import { describe, it, expect } from "vitest";
import {
  fillTemplate,
  formatCoins,
  legendaryOf,
  expectedPulls,
  buildVars,
} from "./format";
import type { GbContent, GbRarity } from "./types";

const rarity = (key: string, probability: number): GbRarity => ({
  key,
  label: key,
  color: "#000",
  probability,
  pool: [{ name: key, emoji: "⭐" }],
});

const content = {
  rarities: [
    rarity("common", 0.7),
    rarity("advanced", 0.23),
    rarity("rare", 0.055),
    rarity("legendary", 0.015),
  ],
  shop: { gachaPrice: 1000, coins: 10000 },
} as unknown as GbContent;

describe("gacha-box/format", () => {
  describe("expectedPulls", () => {
    it("1 ÷ 확률 반올림", () => {
      expect(expectedPulls(0.015)).toBe(67);
      expect(expectedPulls(0.5)).toBe(2);
      expect(expectedPulls(0.1)).toBe(10);
    });
    it("확률이 0 이하이면 0(0으로 나누기 방지)", () => {
      expect(expectedPulls(0)).toBe(0);
      expect(expectedPulls(-0.1)).toBe(0);
    });
  });

  describe("formatCoins", () => {
    it("천 단위 콤마", () => {
      expect(formatCoins(1000)).toBe("1,000");
      expect(formatCoins(67000)).toBe("67,000");
      expect(formatCoins(0)).toBe("0");
    });
  });

  describe("fillTemplate", () => {
    it("아는 자리만 치환하고 모르는 자리는 그대로 둔다", () => {
      expect(fillTemplate("{a}b{c}", { a: "X" })).toBe("Xb{c}");
      expect(fillTemplate("전설 {전설확률}%", { 전설확률: "1.5" })).toBe("전설 1.5%");
    });
  });

  describe("legendaryOf", () => {
    it("key='legendary'로 찾는다", () => {
      expect(legendaryOf(content).key).toBe("legendary");
    });
    it("legendary key가 없으면 마지막 등급", () => {
      const c = { rarities: [rarity("common", 0.9), rarity("rare", 0.1)] } as unknown as GbContent;
      expect(legendaryOf(c).key).toBe("rare");
    });
  });

  describe("buildVars", () => {
    it("전설 확률·기대 횟수·용돈 횟수를 계산해 채운다", () => {
      const vars = buildVars(content, { pulls: 3, spentCoins: 3000, nearMissCount: 1 });
      expect(vars.전설확률).toBe("1.5"); // 0.015 → 1.5%
      expect(vars.기대횟수).toBe("67"); // round(1/0.015)
      expect(vars.기대코인).toBe("67,000"); // 67 * 1000
      expect(vars.용돈).toBe("10,000");
      expect(vars.용돈횟수).toBe("10"); // floor(10000/1000)
      expect(vars.뽑기횟수).toBe("3");
      expect(vars.쓴코인).toBe("3,000");
      expect(vars.아쉬움횟수).toBe("1");
    });
  });
});

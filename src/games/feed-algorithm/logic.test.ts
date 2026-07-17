import { describe, it, expect } from "vitest";
import {
  makeInitialStats,
  applyEffects,
  checkGameOver,
  analyzePlayStyle,
} from "./logic";
import type { GameOverEnding, Stats } from "./types";

const stats = (partial: Partial<Stats>): Stats => ({
  eng: 50,
  safe: 50,
  profit: 50,
  trust: 50,
  ...partial,
});

const endings: GameOverEnding[] = [
  { stat: "eng", bound: "low", emoji: "👻", title: "텅 빈 앱", desc: "" },
  { stat: "eng", bound: "high", emoji: "🧟", title: "디지털 좀비", desc: "" },
  { stat: "safe", bound: "low", emoji: "⚖️", title: "청문회", desc: "" },
  { stat: "trust", bound: "high", emoji: "🚫", title: "검열 논란", desc: "" },
];

describe("feed-algorithm/logic", () => {
  it("makeInitialStats: 네 수치를 같은 값으로 초기화", () => {
    expect(makeInitialStats(50)).toEqual({ eng: 50, safe: 50, profit: 50, trust: 50 });
  });

  describe("applyEffects (0~100 clamp)", () => {
    it("일반 가감", () => {
      expect(applyEffects(stats({}), { eng: 10, safe: -5, profit: 0, trust: 20 })).toEqual({
        eng: 60,
        safe: 45,
        profit: 50,
        trust: 70,
      });
    });
    it("100 초과는 100으로 clamp", () => {
      expect(applyEffects(stats({ eng: 95 }), { eng: 30, safe: 0, profit: 0, trust: 0 }).eng).toBe(100);
    });
    it("0 미만은 0으로 clamp", () => {
      expect(applyEffects(stats({ safe: 10 }), { eng: 0, safe: -40, profit: 0, trust: 0 }).safe).toBe(0);
    });
  });

  describe("checkGameOver", () => {
    it("수치 0 이하 → low 엔딩", () => {
      expect(checkGameOver(stats({ eng: 0 }), endings)?.title).toBe("텅 빈 앱");
    });
    it("수치 100 이상 → high 엔딩", () => {
      expect(checkGameOver(stats({ eng: 100 }), endings)?.title).toBe("디지털 좀비");
    });
    it("한계에 닿은 엔딩이 없으면 null", () => {
      // profit이 100이지만 profit/high 엔딩을 안 넣었으므로 null
      expect(checkGameOver(stats({ profit: 100 }), endings)).toBeNull();
    });
    it("모든 수치가 범위 안이면 null", () => {
      expect(checkGameOver(stats({}), endings)).toBeNull();
    });
  });

  describe("analyzePlayStyle", () => {
    it("profit>70 또는 eng>70 → profit", () => {
      expect(analyzePlayStyle(stats({ profit: 80 }))).toBe("profit");
      expect(analyzePlayStyle(stats({ eng: 80 }))).toBe("profit");
    });
    it("safe>70 → safety", () => {
      expect(analyzePlayStyle(stats({ safe: 80 }))).toBe("safety");
    });
    it("그 외 → balance", () => {
      expect(analyzePlayStyle(stats({}))).toBe("balance");
    });
  });
});

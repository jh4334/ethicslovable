import { describe, it, expect } from "vitest";
import { computeRiskScore, countByCategory, pickGaugeLevel } from "./logic";
import type { ContentItem, GaugeLevel } from "./types";

const item = (id: number, category: string): ContentItem => ({
  id,
  category,
  title: "t",
  intensity: 1,
});

describe("filter-bubble/logic", () => {
  describe("countByCategory", () => {
    it("분야별 선택 횟수를 센다", () => {
      expect(countByCategory([item(1, "게임"), item(2, "게임"), item(3, "요리")])).toEqual({
        게임: 2,
        요리: 1,
      });
    });
  });

  describe("computeRiskScore (0~100)", () => {
    it("기록이 없으면 0", () => {
      expect(computeRiskScore([], 8)).toBe(0);
    });
    it("분야가 1개 이하이면 0(집중도 계산 불가)", () => {
      expect(computeRiskScore([item(1, "게임")], 1)).toBe(0);
    });
    it("한 분야에만 몰리면 100(최대 위험)", () => {
      const hist = [item(1, "게임"), item(2, "게임"), item(3, "게임"), item(4, "게임")];
      expect(computeRiskScore(hist, 4)).toBe(100);
    });
    it("모든 분야에 고르게 퍼지면 0(최저 위험)", () => {
      const hist = [item(1, "게임"), item(2, "요리"), item(3, "운동"), item(4, "동물")];
      expect(computeRiskScore(hist, 4)).toBe(0);
    });
    it("중간 집중도는 0과 100 사이", () => {
      const hist = [item(1, "게임"), item(2, "게임"), item(3, "게임"), item(4, "요리")];
      const score = computeRiskScore(hist, 4);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    });
  });

  describe("pickGaugeLevel", () => {
    const levels: GaugeLevel[] = [
      { id: "safe", minScore: 0, label: "안전", description: "" },
      { id: "warn", minScore: 40, label: "주의", description: "" },
      { id: "danger", minScore: 70, label: "위험", description: "" },
    ];
    it("점수 이하 중 가장 높은 구간을 고른다", () => {
      expect(pickGaugeLevel(levels, 0).label).toBe("안전");
      expect(pickGaugeLevel(levels, 50).label).toBe("주의");
      expect(pickGaugeLevel(levels, 100).label).toBe("위험");
    });
    it("경계값은 그 구간에 포함", () => {
      expect(pickGaugeLevel(levels, 40).label).toBe("주의");
      expect(pickGaugeLevel(levels, 70).label).toBe("위험");
    });
  });
});

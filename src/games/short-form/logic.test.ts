import { describe, it, expect } from "vitest";
import {
  formatCount,
  formatVirtual,
  computeScore,
  pickGrade,
  buildQuizChoices,
  fill,
} from "./logic";
import type { SfGrade, SfStats } from "./types";

const stats = (partial: Partial<SfStats>): SfStats => ({
  watched: 0,
  virtualSec: 0,
  jackpotSeen: 0,
  likeCount: 0,
  totalErrorMin: 0,
  quizCount: 0,
  ...partial,
});

describe("short-form/logic", () => {
  describe("formatCount", () => {
    it("포맷: 만/천/그대로", () => {
      expect(formatCount(45200)).toBe("4.5만");
      expect(formatCount(8800)).toBe("8.8천");
      expect(formatCount(500)).toBe("500");
    });
    it("경계: .0은 떼고, 10만 이상은 정수", () => {
      expect(formatCount(10000)).toBe("1만");
      expect(formatCount(1000)).toBe("1천");
      expect(formatCount(100000)).toBe("10만");
      expect(formatCount(999)).toBe("999");
    });
  });

  describe("formatVirtual", () => {
    it("초/분/분초 표기", () => {
      expect(formatVirtual(30)).toBe("30초");
      expect(formatVirtual(60)).toBe("1분");
      expect(formatVirtual(90)).toBe("1분 30초");
    });
  });

  describe("computeScore", () => {
    it("멈춤(early=3)+시간감각(오차0.2→2) = 5점 만점", () => {
      expect(computeScore("early", stats({ quizCount: 2, totalErrorMin: 0.4 }))).toBe(5);
    });
    it("늦게 멈춤(1)+중간 오차(2분 이하→1) = 2점", () => {
      expect(computeScore("late", stats({ quizCount: 2, totalErrorMin: 3 }))).toBe(2);
    });
    it("강제 종료(0)+큰 오차(0) = 0점", () => {
      expect(computeScore("forced", stats({ quizCount: 1, totalErrorMin: 5 }))).toBe(0);
    });
    it("퀴즈를 안 풀면 시간 점수 0 (99분 취급)", () => {
      expect(computeScore("early", stats({ quizCount: 0, totalErrorMin: 0 }))).toBe(3);
    });
  });

  describe("pickGrade", () => {
    const grades: SfGrade[] = [
      { min: 0, emoji: "🌱", name: "새싹", line: "" },
      { min: 3, emoji: "🛡️", name: "지킴이", line: "" },
      { min: 5, emoji: "🏅", name: "달인", line: "" },
    ];
    it("min 내림차순으로 첫 매칭", () => {
      expect(pickGrade(grades, 5).name).toBe("달인");
      expect(pickGrade(grades, 4).name).toBe("지킴이");
      expect(pickGrade(grades, 0).name).toBe("새싹");
    });
    it("어느 구간에도 못 미치면 최저 구간", () => {
      expect(pickGrade(grades, -1).name).toBe("새싹");
    });
  });

  describe("buildQuizChoices", () => {
    it("정답을 포함한 4개의 서로 다른 양의 정수", () => {
      const choices = buildQuizChoices(5);
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices).toContain(5);
      for (const c of choices) {
        expect(Number.isInteger(c)).toBe(true);
        expect(c).toBeGreaterThanOrEqual(1);
      }
    });
    it("작은 정답도 항상 4개를 채운다(1분 하한)", () => {
      const choices = buildQuizChoices(1);
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(Math.min(...choices)).toBeGreaterThanOrEqual(1);
    });
  });

  describe("fill", () => {
    it("아는 키만 치환하고 모르는 키는 남긴다", () => {
      expect(fill("{영상수}개 {시간}", { 영상수: 18, 시간: "9분" })).toBe("18개 9분");
      expect(fill("{미지}", {})).toBe("{미지}");
    });
  });
});

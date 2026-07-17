import { describe, it, expect } from "vitest";
import { countTags, buildProfile, pickAds, formatElapsed } from "./logic";
import type { DtAction, DtContent, DtTagCount } from "./types";

const action = (tags: string[]): DtAction => ({
  kind: "like",
  target: "x",
  tags,
  atSec: 0,
});

// 로직이 실제로 읽는 필드만 채운 최소 콘텐츠(테스트 전용).
const content = {
  profile: {
    secondaryLine: "'{태그}' 이야기에도 관심이 있는 것 같아요.",
    templates: {
      동물: "동물을 좋아하는 사람이에요.",
      게임: "게임을 좋아하는 사람이에요.",
      default: "여러 가지에 두루 관심이 많아요.",
    },
  },
  adSection: {
    reasonTemplate: "'{태그}'를 {횟수}번 눌렀어요.",
    genericReason: "빈자리를 채운 광고예요.",
  },
  adPool: [
    { tag: "동물", emoji: "🦴", title: "강아지 간식", line: "" },
    { tag: "게임", emoji: "🕹️", title: "게임 아이템", line: "" },
    { tag: "요리", emoji: "🧁", title: "요리 도구", line: "" },
    { tag: "*", bait: true, emoji: "🎁", title: "무료 선물", line: "", baitReason: "낚시예요." },
  ],
} as unknown as DtContent;

describe("data-trail/logic", () => {
  describe("countTags", () => {
    it("태그를 세어 내림차순 정렬한다", () => {
      const log = [action(["동물", "귀여움"]), action(["동물"]), action(["게임"])];
      expect(countTags(log)).toEqual([
        { tag: "동물", count: 2 },
        { tag: "귀여움", count: 1 },
        { tag: "게임", count: 1 },
      ]);
    });
    it("동률이면 먼저 등장한 태그가 앞선다(안정 정렬)", () => {
      const ranking = countTags([action(["게임"]), action(["동물"])]);
      expect(ranking.map((r) => r.tag)).toEqual(["게임", "동물"]);
    });
    it("빈 로그면 빈 배열", () => {
      expect(countTags([])).toEqual([]);
    });
  });

  describe("buildProfile", () => {
    it("1위 태그로 문구를, 2위 태그로 부제를 만든다", () => {
      const ranking: DtTagCount[] = [
        { tag: "동물", count: 3 },
        { tag: "게임", count: 1 },
      ];
      const p = buildProfile(content, ranking);
      expect(p.line).toBe("동물을 좋아하는 사람이에요.");
      expect(p.subLine).toBe("'게임' 이야기에도 관심이 있는 것 같아요.");
      expect(p.top).toHaveLength(2);
    });
    it("매칭 실패 태그는 default 문구, 태그 1개면 부제 없음", () => {
      const ranking: DtTagCount[] = [{ tag: "미지태그", count: 1 }];
      const p = buildProfile(content, ranking);
      expect(p.line).toBe("여러 가지에 두루 관심이 많아요.");
      expect(p.subLine).toBeNull();
    });
    it("순위가 비면 default 문구", () => {
      expect(buildProfile(content, []).line).toBe("여러 가지에 두루 관심이 많아요.");
    });
  });

  describe("pickAds", () => {
    it("맞춤 광고 2장 + 낚시 광고 1장(가운데)", () => {
      const ranking: DtTagCount[] = [
        { tag: "동물", count: 3 },
        { tag: "게임", count: 2 },
      ];
      const ads = pickAds(content, ranking);
      expect(ads).toHaveLength(3);
      expect(ads[1].isBait).toBe(true); // 가운데가 낚시
      expect(ads.filter((a) => a.isBait)).toHaveLength(1);
      expect(ads[0].title).toBe("강아지 간식");
      expect(ads[0].reason).toBe("'동물'를 3번 눌렀어요.");
    });
    it("맞는 광고가 모자라면 남은 광고로 채우고 일반 이유를 붙인다", () => {
      const ranking: DtTagCount[] = [{ tag: "동물", count: 1 }];
      const ads = pickAds(content, ranking);
      expect(ads).toHaveLength(3);
      const filler = ads.find((a) => !a.isBait && a.title !== "강아지 간식");
      expect(filler?.reason).toBe("빈자리를 채운 광고예요.");
    });
  });

  describe("formatElapsed", () => {
    it("초/분/분초", () => {
      expect(formatElapsed(12)).toBe("12초 뒤");
      expect(formatElapsed(65)).toBe("1분 5초 뒤");
      expect(formatElapsed(120)).toBe("2분 뒤");
    });
  });
});

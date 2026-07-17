import { describe, it, expect } from "vitest";
import { judgeCard, fillTemplate } from "./judge";
import type { DbBabyBot, DbTestCard, DbTrainingCard } from "./types";

const train = (species: string, variantTags: string[]): DbTrainingCard => ({
  id: `${species}-${variantTags.join("")}`,
  emoji: "🐾",
  label: species,
  species,
  variantTags,
});

const test = (species: string, requiredVariant: string): DbTestCard => ({
  id: `t-${species}`,
  emoji: "❓",
  label: species,
  species,
  requiredVariant,
  explanationWhenWrong: "",
});

const bot: DbBabyBot = {
  name: "아기봇",
  hungryLine: "",
  pickingLine: "",
  readyLine: "",
  eatingLine: "",
  thinkingLine: "",
  correctTemplates: ["{이름}!"],
  wrongGuessTemplates: ["{이름} 같아요"],
  confusedLines: ["모르겠어요"],
};

describe("data-bias/judge", () => {
  describe("judgeCard 3분기", () => {
    it("정답: 같은 종 + 필요한 특징을 모두 배웠을 때", () => {
      const training = [train("강아지", ["갈색", "큰"]), train("고양이", ["검정"])];
      const r = judgeCard(test("강아지", "갈색"), training, bot, 0);
      expect(r.correct).toBe(true);
      expect(r.hasSpecies).toBe(true);
      expect(r.hasVariant).toBe(true);
      expect(r.botAnswer).toBe("강아지");
      expect(r.botLine).toBe("강아지!");
    });

    it("엉뚱한 추측: 종을 못 배웠고 다른 종이 있을 때 최다 학습 종으로 답한다", () => {
      const training = [train("고양이", ["검정"]), train("고양이", ["흰색"]), train("새", ["갈색"])];
      const r = judgeCard(test("강아지", "검정"), training, bot, 0);
      expect(r.correct).toBe(false);
      expect(r.hasSpecies).toBe(false);
      expect(r.botAnswer).toBe("고양이"); // 가장 많이 배운 다른 종
      expect(r.botLine).toBe("고양이 같아요");
      expect(r.missing).toContain("강아지 데이터");
    });

    it("헷갈림: 종은 배웠지만 특징이 낯설 때 '모르겠어요'", () => {
      const training = [train("강아지", ["갈색"])];
      const r = judgeCard(test("강아지", "검정"), training, bot, 0);
      expect(r.correct).toBe(false);
      expect(r.hasSpecies).toBe(true);
      expect(r.hasVariant).toBe(false);
      expect(r.botAnswer).toBe("모르겠어요");
      expect(r.botLine).toBe("모르겠어요");
      expect(r.missing).toContain("'검정' 특징 데이터");
    });

    it("헷갈림: 종도 못 배웠고 대체할 다른 종도 없으면(빈 훈련) '모르겠어요'", () => {
      const r = judgeCard(test("고양이", "갈색"), [], bot, 0);
      expect(r.correct).toBe(false);
      expect(r.hasSpecies).toBe(false);
      expect(r.botAnswer).toBe("모르겠어요");
    });
  });

  describe("fillTemplate", () => {
    it("{키} 자리를 값으로 채운다", () => {
      expect(fillTemplate("이건 {이름}!", "이름", "강아지")).toBe("이건 강아지!");
      expect(fillTemplate("{개수}장", "개수", "8")).toBe("8장");
    });
  });
});

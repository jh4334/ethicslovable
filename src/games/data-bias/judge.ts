/**
 * 아기봇 판정 로직 — 단순하고 결정적(deterministic)이어서 수업 시간에
 * 말로 설명할 수 있다.
 *
 * 시험 카드를 맞히는 조건 (둘 다 필요):
 *  ① 훈련 데이터에 시험 카드와 같은 종(species) 카드가 1장 이상
 *  ② 훈련 데이터에 시험 카드의 requiredVariant 특징을 가진 카드가
 *     1장 이상 (종은 달라도 된다 — 예: '검은 강아지'가 '검정' 특징을 채워
 *     '검은 고양이' 문제의 ②를 만족시킬 수 있다)
 *
 * 틀렸을 때 아기봇의 답:
 *  - 종 자체를 못 배웠으면 → 가장 많이 먹은 다른 종으로 엉뚱하게 추측
 *  - 종은 알지만 특징이 낯설면 → "모르겠어요" 하고 헷갈려 한다
 */
import type { DbBabyBot, DbTestCard, DbTrainingCard, Judgement } from "./types";

/** 배열에서 index 기반으로 결정적으로 하나 고른다 (StrictMode-safe) */
function pickLine(lines: string[], index: number): string {
  if (lines.length === 0) return "";
  return lines[index % lines.length];
}

/** {이름} 같은 자리 표시자를 채운다 (ES2020 대상이라 replaceAll 미사용) */
export function fillTemplate(template: string, key: string, value: string): string {
  return template.split(`{${key}}`).join(value);
}

/** 훈련 데이터에서 exclude 종을 뺀 최다 학습 종 — 아기봇의 엉뚱한 추측 */
function mostTrainedSpecies(training: DbTrainingCard[], exclude: string): string | null {
  const counts = new Map<string, number>();
  for (const card of training) {
    if (card.species === exclude) continue;
    counts.set(card.species, (counts.get(card.species) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [species, count] of counts) {
    if (count > bestCount) {
      best = species;
      bestCount = count;
    }
  }
  return best;
}

export function judgeCard(
  card: DbTestCard,
  training: DbTrainingCard[],
  bot: DbBabyBot,
  index: number,
): Judgement {
  const hasSpecies = training.some((t) => t.species === card.species);
  const hasVariant = training.some((t) => t.variantTags.includes(card.requiredVariant));
  const correct = hasSpecies && hasVariant;

  const missing: string[] = [];
  if (!hasSpecies) missing.push(`${card.species} 데이터`);
  if (!hasVariant) missing.push(`'${card.requiredVariant}' 특징 데이터`);

  if (correct) {
    return {
      correct,
      hasSpecies,
      hasVariant,
      botAnswer: card.species,
      botLine: fillTemplate(pickLine(bot.correctTemplates, index), "이름", card.species),
      missing,
    };
  }

  if (!hasSpecies) {
    const guess = mostTrainedSpecies(training, card.species);
    if (guess) {
      return {
        correct,
        hasSpecies,
        hasVariant,
        botAnswer: guess,
        botLine: fillTemplate(pickLine(bot.wrongGuessTemplates, index), "이름", guess),
        missing,
      };
    }
  }

  return {
    correct,
    hasSpecies,
    hasVariant,
    botAnswer: "모르겠어요",
    botLine: pickLine(bot.confusedLines, index),
    missing,
  };
}

export function judgeRound(
  testCards: DbTestCard[],
  training: DbTrainingCard[],
  bot: DbBabyBot,
): Judgement[] {
  return testCards.map((card, i) => judgeCard(card, training, bot, i));
}

import { describe, it, expect } from "vitest";
import { GAMES, CHAPTERS } from "./games";
import { GAME_IDS } from "@/lib/progress";

/**
 * GAMES(레지스트리)와 GAME_IDS(진행 저장용 유니온)는 두 곳에 나뉘어 있다
 * (games.ts가 progress.ts의 GameId 타입을 import 하므로 순환을 피하려 분리).
 * 새 게임을 추가할 때 둘 중 하나만 고치면 진행률·수료증이 어긋난다.
 * 이 테스트가 두 목록을 한 소스처럼 강제한다.
 */
describe("게임 레지스트리 정합성", () => {
  it("GAMES와 GAME_IDS의 집합이 정확히 일치한다", () => {
    const fromGames = [...GAMES.map((g) => g.id)].sort();
    const fromIds = [...GAME_IDS].sort();
    expect(fromGames).toEqual(fromIds);
  });

  it("차시(lesson)는 1..N 연속이고 중복이 없다", () => {
    const lessons = GAMES.map((g) => g.lesson).sort((a, b) => a - b);
    expect(lessons).toEqual(GAMES.map((_, i) => i + 1));
  });

  it("모든 게임의 chapter가 CHAPTERS에 정의돼 있다", () => {
    const chapters = new Set(CHAPTERS.map((c) => c.chapter));
    for (const g of GAMES) expect(chapters.has(g.chapter)).toBe(true);
  });

  it("id·path에 중복이 없다", () => {
    expect(new Set(GAMES.map((g) => g.id)).size).toBe(GAMES.length);
    expect(new Set(GAMES.map((g) => g.path)).size).toBe(GAMES.length);
  });
});

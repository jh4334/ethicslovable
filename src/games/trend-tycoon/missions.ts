import type { MissionCheckResult, RankedVideo } from "./types";

/**
 * 미션 달성 판정 로직.
 *
 * 이야기·문구는 콘텐츠 JSON(src/content/trend-tycoon.json)에 있고,
 * 여기에는 같은 id 로 연결되는 "달성 조건" 규칙만 둔다.
 * 모든 판정 함수는 진행 상황 문구(summary)도 함께 돌려줘서
 * 다섯 레벨 모두 미션 패널에 실시간 진행 상황이 표시된다.
 */
type MissionCheck = (videos: RankedVideo[]) => MissionCheckResult;

/** 상위 n개 영상을 "1위 · 카테고리 · 제목" 목록으로 만든다 */
function listTop(videos: RankedVideo[], n: number): string[] {
  return videos.slice(0, n).map((v, i) => `${i + 1}위 · ${v.category} · ${v.title}`);
}

const missionChecks: Record<string, MissionCheck> = {
  // 1레벨: 1~3위 안에 '학습' 영상 2개 이상
  "parents-complaint": (videos) => {
    const top3 = videos.slice(0, 3);
    const count = top3.filter((v) => v.category === "학습").length;
    return {
      complete: count >= 2,
      summary: `지금 1~3위 중 학습 영상 ${count}개 (목표: 2개 이상)`,
      details: listTop(videos, 3),
    };
  },

  // 2레벨: 1~5위 안에 자극도 4 이상 영상 0개
  "clean-campaign": (videos) => {
    const top5 = videos.slice(0, 5);
    const count = top5.filter((v) => v.intensity >= 4).length;
    return {
      complete: count === 0,
      summary: `지금 1~5위 중 자극도 4 이상 영상 ${count}개 (목표: 0개)`,
      details: listTop(videos, 5),
    };
  },

  // 3레벨: 1~10위 안에 '광고' 영상 2개 이상
  "advertiser-pressure": (videos) => {
    const top10 = videos.slice(0, 10);
    const count = top10.filter((v) => v.category === "광고").length;
    return {
      complete: count >= 2,
      summary: `지금 1~10위 중 광고 영상 ${count}개 (목표: 2개 이상)`,
    };
  },

  // 4레벨: 1~5위가 전부 자극도 3 이상
  "dopamine-addiction": (videos) => {
    const top5 = videos.slice(0, 5);
    const count = top5.filter((v) => v.intensity >= 3).length;
    return {
      complete: count === 5,
      summary: `지금 1~5위 중 자극도 3 이상 영상 ${count}개 (목표: 5개 전부)`,
      details: listTop(videos, 5),
    };
  },

  // 5레벨: 1~5위 안에 학습·게임·뉴스가 각각 1개 이상
  "golden-balance": (videos) => {
    const top5 = videos.slice(0, 5);
    const has = (category: string) => top5.some((v) => v.category === category);
    const learning = has("학습");
    const game = has("게임");
    const news = has("뉴스");
    const mark = (ok: boolean) => (ok ? "있음 ✅" : "없음 ❌");
    return {
      complete: learning && game && news,
      summary: `1~5위 안 → 학습 ${mark(learning)} · 게임 ${mark(game)} · 뉴스 ${mark(news)}`,
      details: listTop(videos, 5),
    };
  },
};

/** id 로 미션 판정을 실행한다 (모르는 id 는 안전하게 미달성 처리) */
export function checkMission(missionId: string, videos: RankedVideo[]): MissionCheckResult {
  const check = missionChecks[missionId];
  if (!check) {
    return { complete: false, summary: "미션 규칙을 찾을 수 없어요. 콘텐츠 파일의 id를 확인해 주세요." };
  }
  return check(videos);
}

/** 5레벨 황금 밸런스 보너스 판정: 상위 5개가 모두 자극도 4 미만(건강한 추천)인가 */
export function isCleanTop5(videos: RankedVideo[]): boolean {
  return videos.slice(0, 5).every((v) => v.intensity < 4);
}

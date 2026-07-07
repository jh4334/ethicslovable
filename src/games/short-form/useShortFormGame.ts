/**
 * 멈출 수 없는 화면 — 게임 전체 흐름 훅.
 * intro → feed(누리숏 체험 + 시간 퀴즈 + 멈추기 챌린지) → ending → reveal(설계 해부) → result
 *
 * 시간은 실제 시간이 아니라 가상 시간이다: 영상 1개(스와이프 1번) = 30초.
 * 실제 타이머(setInterval)는 쓰지 않으며, 모든 상태 전이는 이벤트 핸들러에서만
 * 일어난다(StrictMode 이중 실행 안전). 시청 기록은 메모리에만 있고 저장하지 않는다.
 */
import { useMemo, useState } from "react";
import { buildQueue, buildQuizChoices } from "./logic";
import type {
  SfActiveQuiz,
  SfContent,
  SfOutcome,
  SfPhase,
  SfQuizResult,
  SfStats,
  SfVideo,
} from "./types";

export function useShortFormGame(content: SfContent) {
  const { rules } = content;

  const [phase, setPhase] = useState<SfPhase>("intro");
  /** 미리 섞어 둔 재생 대기열 — 강제 종료 시점보다 충분히 길다 */
  const [queue, setQueue] = useState<SfVideo[]>([]);
  /** 현재 보고 있는 영상의 대기열 위치 = 지금까지 넘긴(끝까지 본) 영상 수 */
  const [pos, setPos] = useState(0);
  /** 좋아요를 누른 대기열 위치들 */
  const [likedPos, setLikedPos] = useState<number[]>([]);
  const [quiz, setQuiz] = useState<SfActiveQuiz | null>(null);
  const [quizResults, setQuizResults] = useState<SfQuizResult[]>([]);
  const [outcome, setOutcome] = useState<SfOutcome | null>(null);

  const startFeed = () => {
    setQueue(buildQueue(content.videos));
    setPos(0);
    setLikedPos([]);
    setQuiz(null);
    setQuizResults([]);
    setOutcome(null);
    setPhase("feed");
  };

  const current = queue[pos] ?? content.videos[0];
  const likedCurrent = likedPos.includes(pos);

  /**
   * 멈추기 챌린지 알림 단계.
   * -1: 아직 없음 / 0: 첫 알림(이 구간에 멈추면 성공) / 1: 커진 알림 / 2: 마지막 경고
   */
  const alarmLevel = useMemo(() => {
    if (pos < rules.stopChallengeAfter) return -1;
    if (pos < rules.stopChallengeAfter + rules.stopSuccessWindow) return 0;
    if (pos < rules.forceEndAfter - 2) return 1;
    return 2;
  }, [pos, rules]);

  /** 다음 영상으로 — 스와이프·휠·버튼이 모두 이 함수를 부른다 */
  const swipeNext = () => {
    if (phase !== "feed" || quiz) return;
    const next = pos + 1;

    // 강제 종료 — 결국 앱이 아니라 지킴이 본부가 화면을 끈다
    if (next >= rules.forceEndAfter) {
      setPos(next);
      setOutcome("forced");
      setPhase("ending");
      return;
    }

    setPos(next);

    // 시간 퀴즈 인터럽트 — 정해진 번째 영상을 넘긴 직후
    const quizIndex = rules.quizAfterSwipes.indexOf(next);
    if (quizIndex >= 0 && !quizResults.some((r) => r.index === quizIndex)) {
      const actualMin = Math.round((next * rules.virtualSecondsPerVideo) / 60);
      setQuiz({
        index: quizIndex,
        actualMin,
        choices: buildQuizChoices(actualMin),
        picked: null,
      });
    }
  };

  const likeCurrent = () => {
    if (phase !== "feed" || quiz) return;
    setLikedPos((prev) => (prev.includes(pos) ? prev : [...prev, pos]));
  };

  const answerQuiz = (picked: number) => {
    setQuiz((q) => (q && q.picked === null ? { ...q, picked } : q));
  };

  const closeQuiz = () => {
    if (quiz && quiz.picked !== null) {
      const done = quiz;
      setQuizResults((prev) =>
        prev.some((r) => r.index === done.index)
          ? prev
          : [
              ...prev,
              { index: done.index, actualMin: done.actualMin, pickedMin: done.picked as number },
            ],
      );
    }
    setQuiz(null);
  };

  /** '그만 보기' — 챌린지 시작 후에만 의미가 있다 */
  const stopNow = () => {
    if (phase !== "feed" || pos < rules.stopChallengeAfter) return;
    setOutcome(
      pos < rules.stopChallengeAfter + rules.stopSuccessWindow ? "early" : "late",
    );
    setPhase("ending");
  };

  const goReveal = () => setPhase("reveal");
  const goResult = () => setPhase("result");

  const restart = () => {
    setQueue([]);
    setPos(0);
    setLikedPos([]);
    setQuiz(null);
    setQuizResults([]);
    setOutcome(null);
    setPhase("intro");
  };

  const stats: SfStats = useMemo(() => {
    const watched = pos;
    const jackpotSeen = queue
      .slice(0, Math.min(pos, queue.length))
      .filter((v) => v.isJackpot).length;
    const totalErrorMin = quizResults.reduce(
      (sum, r) => sum + Math.abs(r.pickedMin - r.actualMin),
      0,
    );
    return {
      watched,
      virtualSec: watched * rules.virtualSecondsPerVideo,
      jackpotSeen,
      likeCount: likedPos.length,
      totalErrorMin,
      quizCount: quizResults.length,
    };
  }, [pos, queue, quizResults, likedPos, rules.virtualSecondsPerVideo]);

  return {
    phase,
    current,
    pos,
    likedCurrent,
    quiz,
    quizResults,
    alarmLevel,
    outcome,
    stats,
    startFeed,
    swipeNext,
    likeCurrent,
    answerQuiz,
    closeQuiz,
    stopNow,
    goReveal,
    goResult,
    restart,
  };
}

export type ShortFormGame = ReturnType<typeof useShortFormGame>;

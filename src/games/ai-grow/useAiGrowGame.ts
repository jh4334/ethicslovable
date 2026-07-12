/**
 * AI와 함께 크는 나 — 게임 상태 관리 훅.
 *
 * 미션(분야별 4단계)을 차례로 해결한다:
 *   ① 배우기(learn) → ② 좋은 질문(question) → ③ AI 답 검토(review)
 *   → ④ 발전시키기(develop) → 미션 결과(result)
 *
 * 핵심 규칙은 모두 '지식 카드 보유(progress.acquired)'로 갈린다:
 *   - ② 좋은 질문: requiresKnowledgeId 를 가진 질문만 열린다(막연한 질문은 늘 열림).
 *   - ③ 오류 발견: botAnswer.requiresKnowledgeId 지식이 있어야 틀린 문장을 잡을 수 있다.
 *   - ④ 발전: requiresKnowledgeId 를 가진 '가장 나다운 마무리'만 열린다.
 * 지식이 없어도 게임은 막힘 없이 끝난다(막연한 질문·그대로 받기·복사 선택지가 늘 열림).
 *
 * StrictMode 안전: 진행은 모두 사용자 클릭(이벤트 핸들러)으로만 굴러가고,
 * 타이머·자동 이펙트·무작위(셔플)가 없어 이펙트가 두 번 돌아도 상태가 어긋나지 않는다.
 */
import { useCallback, useMemo, useState } from "react";
import type {
  AgBotAnswer,
  AgContent,
  AgMission,
  AgQuestion,
  LearnStage,
  MissionProgress,
  MissionStep,
  Phase,
  PickStage,
  ReviewStage,
} from "./types";

function emptyProgress(): MissionProgress {
  return {
    acquired: [],
    quizCorrect: 0,
    questionId: null,
    errorCatchable: false,
    errorCaught: false,
    reviewed: false,
    developIndex: null,
    developBest: false,
  };
}

export interface AiGrowGame {
  phase: Phase;
  missionIndex: number;
  step: MissionStep;

  /** 현재 미션 / 진행 기록 (파생) */
  mission: AgMission;
  progress: MissionProgress;
  question: AgQuestion | null;
  botAnswer: AgBotAnswer | null;

  /** ① 배우기 */
  learnIndex: number;
  learnStage: LearnStage;
  learnQuizPicked: number | null;
  /** 이 카드 확인 문제에서 틀렸던 보기 번호들 (재도전용) */
  learnWrongPicks: number[];

  /** ② 좋은 질문 */
  questionStage: PickStage;
  questionPicked: string | null;

  /** ③ AI 답 검토 */
  reviewStage: ReviewStage;
  reviewWrongPick: boolean;
  /** 틀리게 짚었던 문장들 — 2번 틀리면 '놓침' 처리 */
  reviewWrongLines: string[];

  /** ④ 발전 */
  developStage: PickStage;
  developPicked: number | null;

  /** 집계 (파생) */
  totalMissions: number;
  totalSkill: number;
  maxSkill: number;
  errorsCaught: number;
  growthScore: number;
  allProgress: MissionProgress[];

  /** 질문·발전 선택지가 열려 있는지 (지식 보유 여부) */
  isUnlocked: (requiresKnowledgeId?: string) => boolean;

  start: () => void;
  learnChoose: (learn: boolean) => void;
  learnAnswerQuiz: (optionIndex: number) => void;
  learnNext: () => void;
  pickQuestion: (id: string) => void;
  questionNext: () => void;
  reviewClickSentence: (line: string) => void;
  reviewAccept: () => void;
  reviewNext: () => void;
  pickDevelop: (index: number) => void;
  developNext: () => void;
  missionResultNext: () => void;
  restart: () => void;
}

export function useAiGrowGame(content: AgContent): AiGrowGame {
  const missions = content.missions;

  const [phase, setPhase] = useState<Phase>("start");
  const [missionIndex, setMissionIndex] = useState(0);
  const [step, setStep] = useState<MissionStep>("learn");

  const [progressList, setProgressList] = useState<MissionProgress[]>(() =>
    missions.map(emptyProgress),
  );

  const [learnIndex, setLearnIndex] = useState(0);
  const [learnStage, setLearnStage] = useState<LearnStage>("choose");
  const [learnQuizPicked, setLearnQuizPicked] = useState<number | null>(null);
  const [learnWrongPicks, setLearnWrongPicks] = useState<number[]>([]);

  const [questionStage, setQuestionStage] = useState<PickStage>("choose");
  const [questionPicked, setQuestionPicked] = useState<string | null>(null);

  const [reviewStage, setReviewStage] = useState<ReviewStage>("inspect");
  const [reviewWrongPick, setReviewWrongPick] = useState(false);
  const [reviewWrongLines, setReviewWrongLines] = useState<string[]>([]);

  const [developStage, setDevelopStage] = useState<PickStage>("choose");
  const [developPicked, setDevelopPicked] = useState<number | null>(null);

  const mission = missions[missionIndex];
  const progress = progressList[missionIndex] ?? emptyProgress();

  const updateCurrent = useCallback(
    (fn: (p: MissionProgress) => MissionProgress) => {
      setProgressList((prev) =>
        prev.map((p, i) => (i === missionIndex ? fn(p) : p)),
      );
    },
    [missionIndex],
  );

  const resetMissionSteps = useCallback(() => {
    setStep("learn");
    setLearnIndex(0);
    setLearnStage("choose");
    setLearnQuizPicked(null);
    setLearnWrongPicks([]);
    setQuestionStage("choose");
    setQuestionPicked(null);
    setReviewStage("inspect");
    setReviewWrongPick(false);
    setReviewWrongLines([]);
    setDevelopStage("choose");
    setDevelopPicked(null);
  }, []);

  const start = useCallback(() => {
    setProgressList(missions.map(emptyProgress));
    setMissionIndex(0);
    setPhase("mission");
    resetMissionSteps();
  }, [missions, resetMissionSteps]);

  const restart = useCallback(() => {
    setProgressList(missions.map(emptyProgress));
    setMissionIndex(0);
    setPhase("start");
    resetMissionSteps();
  }, [missions, resetMissionSteps]);

  // ── ① 배우기 ──────────────────────────────────────────────
  const advanceLearn = useCallback(() => {
    setLearnQuizPicked(null);
    setLearnWrongPicks([]);
    if (learnIndex >= mission.knowledgeCards.length - 1) {
      setStep("question");
      setQuestionStage("choose");
      setQuestionPicked(null);
    } else {
      setLearnIndex((i) => i + 1);
      setLearnStage("choose");
    }
  }, [learnIndex, mission.knowledgeCards.length]);

  const learnChoose = useCallback(
    (learn: boolean) => {
      if (learnStage !== "choose") return;
      const card = mission.knowledgeCards[learnIndex];
      if (!card) return;
      if (!learn) {
        advanceLearn();
        return;
      }
      updateCurrent((p) => ({
        ...p,
        acquired: p.acquired.includes(card.id)
          ? p.acquired
          : [...p.acquired, card.id],
      }));
      setLearnStage(card.quiz ? "quiz" : "done");
    },
    [learnStage, mission.knowledgeCards, learnIndex, updateCurrent, advanceLearn],
  );

  const learnAnswerQuiz = useCallback(
    (optionIndex: number) => {
      if (learnStage !== "quiz") return;
      const card = mission.knowledgeCards[learnIndex];
      if (!card?.quiz) return;
      if (optionIndex === card.quiz.answerIndex) {
        // 첫 시도에 맞힌 경우만 점수 — 재도전으로 맞혀도 카드는 이미 얻었다
        if (learnWrongPicks.length === 0) {
          updateCurrent((p) => ({ ...p, quizCorrect: p.quizCorrect + 1 }));
        }
        setLearnQuizPicked(optionIndex);
        setLearnStage("done");
      } else {
        // 틀리면 그 보기만 잠그고 다시 골라 보게 한다 (재도전)
        setLearnWrongPicks((prev) =>
          prev.includes(optionIndex) ? prev : [...prev, optionIndex],
        );
      }
    },
    [learnStage, mission.knowledgeCards, learnIndex, learnWrongPicks, updateCurrent],
  );

  const learnNext = useCallback(() => {
    if (learnStage !== "done") return;
    advanceLearn();
  }, [learnStage, advanceLearn]);

  // ── ② 좋은 질문 ──────────────────────────────────────────
  const isUnlocked = useCallback(
    (requiresKnowledgeId?: string) =>
      !requiresKnowledgeId || progress.acquired.includes(requiresKnowledgeId),
    [progress.acquired],
  );

  const pickQuestion = useCallback(
    (id: string) => {
      if (questionStage !== "choose") return;
      const q = mission.questions.find((it) => it.id === id);
      if (!q) return;
      if (q.requiresKnowledgeId && !progress.acquired.includes(q.requiresKnowledgeId))
        return; // 잠긴 질문은 고를 수 없음
      updateCurrent((p) => ({ ...p, questionId: id }));
      setQuestionPicked(id);
      setQuestionStage("feedback");
    },
    [questionStage, mission.questions, progress.acquired, updateCurrent],
  );

  const questionNext = useCallback(() => {
    if (questionStage !== "feedback" || !questionPicked) return;
    const q = mission.questions.find((it) => it.id === questionPicked);
    const ans = q
      ? mission.botAnswers.find((a) => a.id === q.botAnswerId)
      : undefined;
    const catchable = ans
      ? progress.acquired.includes(ans.requiresKnowledgeId)
      : false;
    updateCurrent((p) => ({ ...p, errorCatchable: catchable }));
    setStep("review");
    setReviewStage("inspect");
    setReviewWrongPick(false);
  }, [
    questionStage,
    questionPicked,
    mission.questions,
    mission.botAnswers,
    progress.acquired,
    updateCurrent,
  ]);

  // ── ③ AI 답 검토 ─────────────────────────────────────────
  const question = useMemo(
    () =>
      mission.questions.find((q) => q.id === progress.questionId) ?? null,
    [mission.questions, progress.questionId],
  );
  const botAnswer = useMemo(
    () =>
      question
        ? mission.botAnswers.find((a) => a.id === question.botAnswerId) ?? null
        : null,
    [question, mission.botAnswers],
  );

  const reviewClickSentence = useCallback(
    (line: string) => {
      if (reviewStage !== "inspect" || !progress.errorCatchable || !botAnswer)
        return;
      if (line === botAnswer.errorSpan) {
        updateCurrent((p) => ({ ...p, errorCaught: true, reviewed: true }));
        setReviewStage("result");
      } else {
        // 틀린 문장은 잠그고, 두 번 틀리면 '놓침'으로 마무리 —
        // 하나씩 다 눌러 보는 찍기를 막아 '아는 만큼 보인다'의 긴장을 지킨다
        // (updater 안에 부작용을 두지 않는다 — StrictMode 이중 실행 안전)
        if (reviewWrongLines.includes(line)) return;
        const next = [...reviewWrongLines, line];
        setReviewWrongLines(next);
        setReviewWrongPick(true);
        if (next.length >= 2) {
          updateCurrent((p) => ({ ...p, errorCaught: false, reviewed: true }));
          setReviewStage("result");
        }
      }
    },
    [reviewStage, progress.errorCatchable, botAnswer, reviewWrongLines, updateCurrent],
  );

  const reviewAccept = useCallback(() => {
    if (reviewStage !== "inspect") return;
    updateCurrent((p) => ({ ...p, errorCaught: false, reviewed: true }));
    setReviewStage("result");
  }, [reviewStage, updateCurrent]);

  const reviewNext = useCallback(() => {
    if (reviewStage !== "result") return;
    setStep("develop");
    setDevelopStage("choose");
    setDevelopPicked(null);
  }, [reviewStage]);

  // ── ④ 발전 ───────────────────────────────────────────────
  const pickDevelop = useCallback(
    (index: number) => {
      if (developStage !== "choose") return;
      const ch = mission.develop.choices[index];
      if (!ch) return;
      if (ch.requiresKnowledgeId && !progress.acquired.includes(ch.requiresKnowledgeId))
        return;
      updateCurrent((p) => ({
        ...p,
        developIndex: index,
        developBest: ch.isBest,
      }));
      setDevelopPicked(index);
      setDevelopStage("feedback");
    },
    [developStage, mission.develop.choices, progress.acquired, updateCurrent],
  );

  const developNext = useCallback(() => {
    if (developStage !== "feedback") return;
    setStep("result");
  }, [developStage]);

  const missionResultNext = useCallback(() => {
    if (missionIndex >= missions.length - 1) {
      setPhase("finale");
      return;
    }
    setMissionIndex((i) => i + 1);
    resetMissionSteps();
  }, [missionIndex, missions.length, resetMissionSteps]);

  // ── 집계 ─────────────────────────────────────────────────
  const totalSkill = useMemo(
    () => progressList.reduce((s, p) => s + p.acquired.length, 0),
    [progressList],
  );
  const maxSkill = useMemo(
    () => missions.reduce((s, m) => s + m.knowledgeCards.length, 0),
    [missions],
  );
  const errorsCaught = useMemo(
    () => progressList.filter((p) => p.errorCaught).length,
    [progressList],
  );
  const growthScore = totalSkill + errorsCaught;

  return useMemo(
    () => ({
      phase,
      missionIndex,
      step,
      mission,
      progress,
      question,
      botAnswer,
      learnIndex,
      learnStage,
      learnQuizPicked,
      learnWrongPicks,
      questionStage,
      questionPicked,
      reviewStage,
      reviewWrongPick,
      reviewWrongLines,
      developStage,
      developPicked,
      totalMissions: missions.length,
      totalSkill,
      maxSkill,
      errorsCaught,
      growthScore,
      allProgress: progressList,
      isUnlocked,
      start,
      learnChoose,
      learnAnswerQuiz,
      learnNext,
      pickQuestion,
      questionNext,
      reviewClickSentence,
      reviewAccept,
      reviewNext,
      pickDevelop,
      developNext,
      missionResultNext,
      restart,
    }),
    [
      phase,
      missionIndex,
      step,
      mission,
      progress,
      question,
      botAnswer,
      learnIndex,
      learnStage,
      learnQuizPicked,
      learnWrongPicks,
      questionStage,
      questionPicked,
      reviewStage,
      reviewWrongPick,
      reviewWrongLines,
      developStage,
      developPicked,
      missions.length,
      totalSkill,
      maxSkill,
      errorsCaught,
      growthScore,
      progressList,
      isUnlocked,
      start,
      learnChoose,
      learnAnswerQuiz,
      learnNext,
      pickQuestion,
      questionNext,
      reviewClickSentence,
      reviewAccept,
      reviewNext,
      pickDevelop,
      developNext,
      missionResultNext,
      restart,
    ],
  );
}

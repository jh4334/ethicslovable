import {
  ArrowRight,
  Bot,
  BookOpen,
  Check,
  Lightbulb,
  Lock,
  MessageCircle,
  Search,
  Sprout,
  X,
} from "lucide-react";
import type { AgContent, MissionStep } from "../types";
import type { AiGrowGame } from "../useAiGrowGame";

interface MissionScreenProps {
  content: AgContent;
  game: AiGrowGame;
}

const STEP_ORDER: MissionStep[] = ["learn", "question", "review", "develop"];

/** 미션 무대 — 4단계(배우기·질문·검토·발전)를 차례로 진행한다. */
export default function MissionScreen({ content, game }: MissionScreenProps) {
  const { labels } = content;
  const { mission } = game;
  const stepIdx = game.step === "result" ? 4 : STEP_ORDER.indexOf(game.step);

  return (
    <div className="ag-shell flex min-h-[calc(100vh-3rem)] flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* 미션 머리글 + 지식 집계 */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-xs font-extrabold text-muted-foreground">
            {labels.missionLabel} {game.missionIndex + 1} / {game.totalMissions}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
            <Sprout className="h-3.5 w-3.5" />
            지식 {game.progress.acquired.length} / {mission.knowledgeCards.length}
          </span>
        </div>

        <div className="mlq-card mb-4 flex items-center gap-3 p-4">
          <span className="ag-mission-emoji flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl" aria-hidden>
            {mission.emoji}
          </span>
          <div>
            <span className="ag-chip-field inline-block rounded-full px-1.5 py-0.5 text-[10px] font-black">
              {mission.field}
            </span>
            <p className="mt-0.5 text-sm font-black leading-tight sm:text-base">
              {mission.title}
            </p>
          </div>
        </div>

        {/* 4단계 진행 트래커 — 알차게 채운 단계만 초록, 건너뛴 단계는 회색 체크 */}
        <ol className="ag-steps mb-5">
          {labels.stepNames.map((name, i) => {
            const done = i < stepIdx;
            const current = i === stepIdx;
            const p = game.progress;
            const pickedQ = game.mission.questions.find((q) => q.id === p.questionId);
            const quality = [
              p.acquired.length > 0,
              Boolean(pickedQ?.isGood),
              p.errorCaught,
              p.developBest,
            ][i];
            return (
              <li
                key={name}
                className={[
                  "ag-step flex-1 justify-center",
                  done ? (quality ? "ag-step-done" : "ag-step-weak") : current ? "ag-step-current" : "",
                ].join(" ")}
              >
                <span className="ag-step-num">
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {/* 모바일에서도 지금 단계 이름은 보인다 */}
                <span className={current ? "inline" : "hidden sm:inline"}>{name}</span>
              </li>
            );
          })}
        </ol>

        {game.step === "learn" && <LearnStep content={content} game={game} />}
        {game.step === "question" && (
          <QuestionStep content={content} game={game} />
        )}
        {game.step === "review" && <ReviewStep content={content} game={game} />}
        {game.step === "develop" && (
          <DevelopStep content={content} game={game} />
        )}
        {game.step === "result" && (
          <MissionResult content={content} game={game} />
        )}
      </div>
    </div>
  );
}

/* ══════════════ ① 배우기 ══════════════ */
function LearnStep({ content, game }: MissionScreenProps) {
  const { labels } = content;
  const cards = game.mission.knowledgeCards;
  const card = cards[game.learnIndex];
  const acquired = game.progress.acquired.includes(card.id);

  return (
    <div className="animate-fade-in">
      <p className="mb-3 text-sm font-bold leading-relaxed">{game.mission.story}</p>
      <p className="mb-4 rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs leading-relaxed text-foreground/80">
        📚 {labels.learnIntro}
      </p>

      <div className="mb-2 text-center text-xs font-extrabold text-muted-foreground">
        {labels.learnCardOf} {game.learnIndex + 1} / {cards.length}
      </div>

      <div className="ag-learn-card p-5 sm:p-6" key={card.id}>
        <div className="mb-3 flex items-center gap-3">
          <span className="ag-card-icon" aria-hidden>
            {card.icon}
          </span>
          <span className="text-base font-black">{card.title}</span>
        </div>

        {/* 선택 전: 배울까 건너뛸까 */}
        {game.learnStage === "choose" && (
          <>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              이 지식을 배우면 뒷단계에서 내 힘이 돼요.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => game.learnChoose(true)}
                className="ag-btn-cta inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-extrabold"
              >
                <BookOpen className="h-4 w-4" />
                {labels.learnBtn}
              </button>
              <button
                onClick={() => game.learnChoose(false)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-muted-foreground transition hover:bg-muted"
              >
                {labels.skipBtn}
              </button>
            </div>
          </>
        )}

        {/* 퀴즈 — 틀리면 그 보기만 잠기고 다시 골라 본다 (재도전) */}
        {game.learnStage === "quiz" && card.quiz && (
          <>
            <p className="mb-3 rounded-xl bg-muted/60 p-3 text-sm font-bold leading-relaxed">
              {card.fact}
            </p>
            <p className="mb-2 text-xs font-extrabold text-primary">
              ❓ {labels.quizPrompt}: {card.quiz.q}
            </p>
            <div className="flex flex-col gap-2">
              {card.quiz.options.map((opt, oi) => {
                const wrongTried = game.learnWrongPicks.includes(oi);
                return (
                  <button
                    key={oi}
                    onClick={() => game.learnAnswerQuiz(oi)}
                    disabled={wrongTried}
                    className={[
                      "ag-opt px-4 py-2.5 text-sm font-bold",
                      wrongTried ? "opacity-40 line-through" : "",
                    ].join(" ")}
                  >
                    {wrongTried ? "✕ " : ""}
                    {opt}
                  </button>
                );
              })}
            </div>
            {game.learnWrongPicks.length > 0 && (
              <div className="ag-verdict-bad animate-fade-in mt-3 rounded-xl p-3 text-sm leading-relaxed">
                <p className="mb-1 font-black">💭 {labels.quizWrong}</p>
                <p className="text-foreground/85">{labels.quizRetryHint}</p>
              </div>
            )}
          </>
        )}

        {/* 배운 뒤 / 퀴즈 결과 */}
        {game.learnStage === "done" && (
          <>
            <p className="mb-3 rounded-xl bg-muted/60 p-3 text-sm font-bold leading-relaxed">
              {card.fact}
            </p>
            {card.quiz && game.learnQuizPicked != null && (
              <div className="ag-verdict-good mb-3 rounded-xl p-3 text-sm leading-relaxed">
                <p className="mb-1 font-black">
                  🎉 {labels.quizCorrect}
                  {game.learnWrongPicks.length > 0 && " (다시 도전해서 맞혔어요!)"}
                </p>
                <p className="text-foreground/85">{card.quiz.explain}</p>
              </div>
            )}
            {acquired && (
              <p className="ag-tag-good mb-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black">
                <Check className="h-3.5 w-3.5" /> {labels.learnedTag}
              </p>
            )}
            <button
              onClick={game.learnNext}
              className="ag-btn-cta inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-extrabold"
            >
              {game.learnIndex >= cards.length - 1
                ? labels.toQuestion
                : labels.learnNext}
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════ ② 좋은 질문 ══════════════ */
function QuestionStep({ content, game }: MissionScreenProps) {
  const { labels } = content;
  const questions = game.mission.questions;
  const picked =
    game.questionPicked != null
      ? questions.find((q) => q.id === game.questionPicked) ?? null
      : null;
  const decided = game.questionStage === "feedback" && picked != null;

  return (
    <div className="animate-fade-in">
      <p className="mb-4 text-center text-sm font-bold leading-relaxed">
        {labels.questionPrompt}
      </p>

      <div className="flex flex-col gap-2.5">
        {questions.map((q) => {
          const locked = !game.isUnlocked(q.requiresKnowledgeId);
          const isPicked = game.questionPicked === q.id;
          const dim = decided && !isPicked;
          return (
            <button
              key={q.id}
              onClick={() => !locked && game.pickQuestion(q.id)}
              disabled={locked || decided}
              className={[
                "ag-opt px-4 py-3 text-sm font-bold leading-relaxed",
                locked ? "ag-opt-locked" : isPicked ? "ag-opt-picked" : "",
                dim ? "opacity-45" : "",
              ].join(" ")}
            >
              <span className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">
                  {locked ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : !decided ? (
                    /* 고르기 전에는 중립 아이콘 — 아이콘으로 정답이 새지 않게 */
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  ) : q.isGood ? (
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  )}
                </span>
                <span>
                  {q.text}
                  {locked && (
                    <span className="ag-tag-lock mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold">
                      🔒 {labels.lockedHint}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {decided && picked && (
        <div
          className={[
            "animate-fade-in mt-4 rounded-2xl p-4",
            picked.isGood ? "ag-verdict-good" : "ag-verdict-bad",
          ].join(" ")}
        >
          <p className="mb-2 text-sm font-black">
            {picked.isGood
              ? `💡 ${labels.goodQuestionTag}`
              : `🤔 ${labels.vagueQuestionTag}`}
          </p>
          <p className="text-sm leading-relaxed text-foreground/85">
            {picked.feedback}
          </p>
          <button
            onClick={game.questionNext}
            className="ag-btn-cta mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-extrabold"
          >
            {labels.toReview}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════ ③ AI 답 검토 ══════════════ */
function ReviewStep({ content, game }: MissionScreenProps) {
  const { labels } = content;
  const ans = game.botAnswer;
  if (!ans) return null;
  const lines = ans.text.split("\n");
  const catchable = game.progress.errorCatchable;
  const done = game.reviewStage === "result";
  const caught = game.progress.errorCaught;

  return (
    <div className="animate-fade-in">
      <p className="mb-3 text-center text-sm font-bold leading-relaxed">
        {labels.reviewPrompt}
      </p>

      {/* 누리봇 답 카드 */}
      <div className="ag-answer mb-3 p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-muted-foreground">
          <span className="ag-bot h-6 w-6 text-sm" aria-hidden>
            🤖
          </span>
          누리봇
        </div>
        <div className="flex flex-col gap-1.5">
          {lines.map((line, li) => {
            const isError = line === ans.errorSpan;
            const wrongTried = game.reviewWrongLines.includes(line);
            const clickable = catchable && !done && !wrongTried;
            const revealError = done && isError;
            return (
              <button
                key={li}
                onClick={() => clickable && game.reviewClickSentence(line)}
                disabled={!clickable}
                className={[
                  "ag-sentence text-left text-sm leading-relaxed",
                  clickable ? "ag-sentence-live" : "",
                  revealError ? "ag-sentence-error" : "",
                  wrongTried && !done ? "opacity-45" : "",
                ].join(" ")}
              >
                {revealError && (
                  <span className="mr-1 font-black">
                    {caught ? "🔍" : "⚠️"}
                  </span>
                )}
                {wrongTried && !done && <span className="mr-1">✓</span>}
                {line}
              </button>
            );
          })}
        </div>
      </div>

      {/* 검토 안내 / 결과 */}
      {!done && catchable && (
        <>
          <p className="mb-2 text-center text-xs font-extrabold text-primary">
            🔍 {labels.canFindHint}
          </p>
          {game.reviewWrongPick && (
            <div className="ag-verdict-bad animate-fade-in rounded-xl p-3 text-center text-xs font-bold leading-relaxed">
              <p>{labels.wrongPick}</p>
              <p className="mt-1">{labels.wrongPickWarn}</p>
            </div>
          )}
        </>
      )}

      {!done && !catchable && (
        <div className="text-center">
          <p className="mb-3 rounded-xl border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
            🌫️ {labels.cannotFindHint}
          </p>
          <button
            onClick={game.reviewAccept}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-muted-foreground transition hover:bg-muted"
          >
            {labels.acceptBtn}
          </button>
        </div>
      )}

      {done && (
        <div
          className={[
            "animate-fade-in rounded-2xl p-4",
            caught ? "ag-verdict-good" : "ag-verdict-bad",
          ].join(" ")}
        >
          <p className="mb-2 flex items-center gap-1.5 text-sm font-black">
            {caught ? (
              <>
                <Check className="h-4 w-4" /> {labels.caughtTag}
              </>
            ) : (
              <>
                <X className="h-4 w-4" /> {labels.missedTag}
              </>
            )}
          </p>
          {!caught && (
            <p className="mb-2 text-sm font-bold leading-relaxed text-foreground/85">
              {labels.missedReveal}
            </p>
          )}
          <p className="text-sm leading-relaxed text-foreground/85">
            {ans.errorFixExplain}
          </p>
          <button
            onClick={game.reviewNext}
            className="ag-btn-cta mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-extrabold"
          >
            {labels.toDevelop}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════ ④ 발전시키기 ══════════════ */
function DevelopStep({ content, game }: MissionScreenProps) {
  const { labels } = content;
  const develop = game.mission.develop;
  const decided = game.developStage === "feedback" && game.developPicked != null;
  const chosen =
    game.developPicked != null ? develop.choices[game.developPicked] : null;

  return (
    <div className="animate-fade-in">
      <p className="mb-1 text-center text-sm font-bold leading-relaxed">
        {develop.prompt}
      </p>
      <p className="mb-4 text-center text-xs text-muted-foreground">
        {labels.developIntro}
      </p>

      <div className="flex flex-col gap-2.5">
        {develop.choices.map((ch, ci) => {
          const locked = !game.isUnlocked(ch.requiresKnowledgeId);
          const isPicked = game.developPicked === ci;
          const dim = decided && !isPicked;
          return (
            <button
              key={ci}
              onClick={() => !locked && game.pickDevelop(ci)}
              disabled={locked || decided}
              className={[
                "ag-opt px-4 py-3 text-sm font-bold leading-relaxed",
                locked ? "ag-opt-locked" : isPicked ? "ag-opt-picked" : "",
                dim ? "opacity-45" : "",
              ].join(" ")}
            >
              <span className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">
                  {locked ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : !decided ? (
                    /* 고르기 전에는 중립 아이콘 — 아이콘으로 정답이 새지 않게 */
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  ) : ch.isBest ? (
                    <Sprout className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  )}
                </span>
                <span>
                  {ch.text}
                  {locked && (
                    <span className="ag-tag-lock mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold">
                      🔒 {labels.lockedHint}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {decided && chosen && (
        <div
          className={[
            "animate-fade-in mt-4 rounded-2xl p-4",
            chosen.isBest ? "ag-verdict-good" : "ag-verdict-bad",
          ].join(" ")}
        >
          <p className="mb-2 text-sm font-black">
            {chosen.isBest ? `🌱 ${labels.bestTag}` : `📄 ${labels.okTag}`}
          </p>
          <p className="text-sm leading-relaxed text-foreground/85">
            {chosen.feedback}
          </p>
          <button
            onClick={game.developNext}
            className="ag-btn-cta mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-extrabold"
          >
            {labels.missionResultTitle}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════ 미션 결과 ══════════════ */
function MissionResult({ content, game }: MissionScreenProps) {
  const { labels } = content;
  const p = game.progress;
  const cardTotal = game.mission.knowledgeCards.length;
  const skill = p.acquired.length;
  const solid = skill >= 2 && p.errorCaught && p.developBest;
  const isLast = game.missionIndex >= game.totalMissions - 1;

  return (
    <div className="animate-fade-in mlq-card p-5 sm:p-6">
      <p className="mb-4 text-center text-base font-black">
        <Search className="mr-1 inline h-4 w-4" /> {labels.missionResultTitle}
      </p>

      {/* 내 실력 게이지 */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs font-extrabold">
          <span>{labels.skillGauge}</span>
          <span className="text-muted-foreground">
            {labels.learnCardOf} {skill} / {cardTotal}
            {labels.cardUnit}
          </span>
        </div>
        <div className="ag-gauge">
          <div
            className={[
              "ag-gauge-fill",
              skill === cardTotal ? "ag-gauge-fill-green" : "",
            ].join(" ")}
            style={{ width: `${(skill / cardTotal) * 100}%` }}
          />
        </div>
      </div>

      {/* 미션 완성도 */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm">
        <span className="font-extrabold">{labels.completionGauge}</span>
        <span
          className={[
            "rounded-full px-2 py-0.5 text-xs font-black",
            solid ? "ag-tag-good" : "ag-tag-vague",
          ].join(" ")}
        >
          {solid ? `✅ ${labels.completionFull}` : `⚠️ ${labels.completionThin}`}
        </span>
      </div>

      {/* 오류 검토 결과 */}
      <div className="mb-5 flex items-center gap-2 text-sm font-bold">
        {p.errorCaught ? (
          <span className="ag-tag-good inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black">
            <Check className="h-3.5 w-3.5" /> {labels.caughtTag}
          </span>
        ) : (
          <span className="ag-tag-vague inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black">
            <X className="h-3.5 w-3.5" /> {labels.missedTag}
          </span>
        )}
      </div>

      <button
        onClick={game.missionResultNext}
        className="ag-btn-cta inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-extrabold"
      >
        {isLast ? labels.toResult : labels.toNextMission}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

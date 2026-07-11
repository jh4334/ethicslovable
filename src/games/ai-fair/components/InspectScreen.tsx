import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AfContent } from "../types";
import type { AiFairGame } from "../useAiFairGame";
import NuriBot from "./NuriBot";

interface InspectScreenProps {
  content: AfContent;
  game: AiFairGame;
}

/** 1부 · 누리봇 공정 시험 — 여섯 사람을 한 명씩 검사한다 */
export default function InspectScreen({ content, game }: InspectScreenProps) {
  const { ui, users, causes } = content;
  const user = game.currentUser;
  const isLast = game.userIndex === users.length - 1;

  const resultText =
    user.botResult === "good"
      ? ui.resultGood
      : user.botResult === "struggle"
        ? ui.resultStruggle
        : ui.resultFail;
  const resultMood =
    user.botResult === "good" ? "happy" : user.botResult === "struggle" ? "struggle" : "fail";
  const resultTone =
    user.botResult === "good"
      ? "border-success/40 bg-success/10 text-success"
      : "border-destructive/40 bg-destructive/10 text-destructive";

  // 판단 정답 여부 (revealed 단계에서 사용)
  const judgeCorrect = game.judgedFair === user.isFair;
  const causeCorrect =
    !user.isFair && game.causePicked !== null && game.causePicked === user.causeId;

  return (
    <div className="mx-auto w-full max-w-md animate-fade-in px-4 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="af-pill text-[11px]">1부</span>
        <h2 className="text-lg font-black">{ui.inspectTitle}</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{ui.inspectGuide}</p>

      {/* 진행 점 */}
      <div className="mt-3 flex items-center gap-1.5">
        {users.map((u, i) => (
          <div
            key={u.id}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              i < game.userIndex ? "af-bar-fill" : i === game.userIndex ? "bg-primary/50" : "bg-muted",
            )}
          />
        ))}
      </div>
      <div className="mt-1 text-right text-[10px] font-medium text-muted-foreground">
        {game.userIndex + 1} / {users.length}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={user.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          {/* 사용자 카드 */}
          <div className="mlq-card mt-3 p-4">
            <div className="flex items-center gap-3">
              <span className="mlq-emoji-tile h-12 w-12 shrink-0 text-2xl" aria-hidden>
                {user.emoji}
              </span>
              <div>
                <div className="text-sm font-extrabold">{user.who}</div>
                <div className="text-[11px] font-medium text-muted-foreground">
                  {ui.requestLabel}
                </div>
              </div>
            </div>
            <p className="mt-2 rounded-xl bg-muted/60 px-3 py-2 text-sm font-semibold leading-relaxed">
              “{user.request}”
            </p>
          </div>

          {/* 누리봇 반응 */}
          <div className="mt-3">
            <div className="text-[11px] font-bold text-muted-foreground">{ui.resultLabel}</div>
            <div className="mt-2">
              <NuriBot line={user.botLine} mood={resultMood} />
            </div>
            <div
              className={cn(
                "mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black",
                resultTone,
              )}
            >
              {user.botResult === "good" ? "🟢" : user.botResult === "struggle" ? "🟡" : "🔴"}{" "}
              {resultText}
            </div>
          </div>

          {/* Step: ask — 공평한가요? */}
          {game.inspectStep === "ask" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4"
            >
              <div className="text-sm font-extrabold">{ui.fairQuestion}</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => game.judgeUser(true)}
                  className="af-pick rounded-2xl border bg-card px-4 py-4 text-sm font-extrabold transition-transform"
                >
                  ⚖️ {ui.answerFair}
                </button>
                <button
                  type="button"
                  onClick={() => game.judgeUser(false)}
                  className="af-pick rounded-2xl border bg-card px-4 py-4 text-sm font-extrabold transition-transform"
                >
                  🚫 {ui.answerUnfair}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step: cause — 원인 카드 고르기 (불공평 사용자만) */}
          {game.inspectStep === "cause" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4"
            >
              <div className="text-sm font-extrabold leading-relaxed">{ui.causeQuestion}</div>
              <div className="mt-2 grid gap-2">
                {causes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => game.pickCause(c.id)}
                    className="af-pick flex items-start gap-2.5 rounded-2xl border bg-card px-3.5 py-3 text-left transition-transform"
                  >
                    <span className="mlq-emoji-tile h-9 w-9 shrink-0 text-lg" aria-hidden>
                      {c.emoji}
                    </span>
                    <span>
                      <span className="text-sm font-extrabold">{c.name}</span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
                        {c.desc}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step: revealed — 검사 결과 */}
          {game.inspectStep === "revealed" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4"
            >
              {/* 판단 채점 */}
              <div
                className={cn(
                  "af-bounce-in flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm font-black",
                  judgeCorrect
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-warning/50 bg-warning/10 text-warning-foreground",
                )}
              >
                <span>{judgeCorrect ? "⭕" : "🤔"}</span>
                <span>
                  {judgeCorrect ? ui.judgeCorrect : ui.judgeWrong}{" "}
                  <span className="font-semibold">
                    (정답: {user.isFair ? ui.answerFair : ui.answerUnfair})
                  </span>
                </span>
              </div>

              {/* 원인 채점 (불공평 사용자만) */}
              {!user.isFair && game.causePicked !== null && (
                <div
                  className={cn(
                    "mt-2 flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-bold",
                    causeCorrect
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-warning/50 bg-warning/10 text-warning-foreground",
                  )}
                >
                  <span>{causeCorrect ? "🗂️" : "🔎"}</span>
                  <span>{causeCorrect ? ui.causeCorrect : ui.causeWrong}</span>
                </div>
              )}

              {/* 설명 */}
              <div className="af-callout mt-3 rounded-2xl p-3.5">
                <div className="text-xs font-extrabold text-foreground/80">🔍 {ui.explainTitle}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{user.explain}</p>
              </div>

              <button
                type="button"
                onClick={game.nextUser}
                className="af-btn mt-4 w-full px-6 py-3 text-sm"
              >
                {isLast ? ui.toFixButton : ui.nextUserButton}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

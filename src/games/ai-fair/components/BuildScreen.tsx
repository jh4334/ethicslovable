import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AfBarrier, AfContent, AfImprovement, AfUser } from "../types";
import type { AiFairGame } from "../useAiFairGame";

interface BuildScreenProps {
  content: AfContent;
  game: AiFairGame;
}

/**
 * 포용 퍼즐 본무대 — 개선 카드를 슬롯에 넣고 '다시 시험하기'를 눌러
 * 여섯 친구가 누리봇을 쓸 수 있는지 재판정한다. 6/6이 되면 통찰로 넘어간다.
 */
export default function BuildScreen({ content, game }: BuildScreenProps) {
  const { ui, users, barriers, improvements } = content;

  const [testing, setTesting] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  // 한 번이라도 '시험'에 넣어 본 카드만 '돕는 사람'을 공개한다 —
  // 처음부터 정답을 알려 주지 않고, 넣고 시험하며 스스로 발견하게 한다.
  const [revealedCardIds, setRevealedCardIds] = useState<Set<string>>(() => new Set());
  // 시험 버튼을 누른 순간의 장착 카드 스냅샷 (판정 후 공개 처리에 사용)
  const testedSnapshot = useRef<string[]>([]);

  const barrierById = useMemo(() => {
    const map = new Map<string, AfBarrier>();
    for (const b of barriers) map.set(b.id, b);
    return map;
  }, [barriers]);

  const total = users.length;
  const enabledCount = game.enabledIds.length;
  const pct = Math.round((enabledCount / total) * 100);

  // 시험 연출: 잠깐 보여 준 뒤 판정 → 결과 공개 (cleanup으로 StrictMode-safe)
  const { runTest } = game;
  useEffect(() => {
    if (!testing) return;
    const timer = setTimeout(() => {
      runTest();
      setTesting(false);
      setShowReveal(true);
      // 이번 시험에 들어가 있던 카드들의 '돕는 사람'을 이제 공개한다
      setRevealedCardIds((prev) => {
        const next = new Set(prev);
        for (const id of testedSnapshot.current) next.add(id);
        return next;
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [testing, runTest]);

  const handleToggle = (id: string) => {
    if (testing) return;
    setShowReveal(false);
    game.toggleCard(id);
  };

  const slotsFull = game.equipped.length >= game.slots;
  const canTest = !testing && game.equipped.length > 0;
  const firstTest = game.rounds === 0;

  /** 카드가 돕는 친구들(장벽 기준) */
  const helpedBy = (imp: AfImprovement): AfUser[] =>
    users.filter((u) => u.barrierId !== "" && imp.helpsBarrierIds.includes(u.barrierId));

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-in px-4 py-5 pb-6">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="af-pill text-[11px]">🤖 포용 설계</span>
        <h2 className="text-lg font-black">{ui.buildTitle}</h2>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ui.buildGuide}</p>

      {/* 포용 미터 */}
      <div className="af-callout mt-3 rounded-2xl p-4">
        <div className="flex items-end justify-between">
          <span className="text-xs font-bold text-foreground/80">⚖️ {ui.meterLabel}</span>
          <span className="af-grad-text text-2xl font-black tabular-nums">
            {enabledCount} / {total}
          </span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="af-bar-fill h-full rounded-full"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          />
        </div>
      </div>

      {/* 친구 6명 */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {users.map((u) => {
          const enabled = game.enabledIds.includes(u.id);
          const isBaseline = u.canUseBaseline;
          const newly = showReveal && (game.lastTest?.newlyEnabledIds.includes(u.id) ?? false);
          const barrier = u.barrierId ? barrierById.get(u.barrierId) : undefined;
          return (
            <motion.div
              key={u.id}
              layout
              className={cn(
                "relative flex gap-2.5 rounded-2xl border bg-card p-3 transition-colors",
                enabled ? "af-friend-on" : "af-friend-off",
                newly && "af-friend-new",
              )}
            >
              <span
                className={cn("mlq-emoji-tile h-11 w-11 shrink-0 text-2xl", !enabled && "grayscale")}
                aria-hidden
              >
                {u.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-extrabold">{u.who}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                      isBaseline
                        ? "bg-muted text-muted-foreground"
                        : enabled
                          ? "af-tag-on"
                          : "af-tag-off",
                    )}
                  >
                    {isBaseline ? ui.baselineTag : enabled ? ui.canUseTag : ui.blockedTag}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {enabled ? (isBaseline ? u.baseLine : u.fixedLine) : barrier?.blockedLine}
                </p>
                {!enabled && barrier && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-foreground/70">
                    {barrier.emoji} {barrier.name}
                  </span>
                )}
              </div>
              {newly && (
                <motion.span
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12 }}
                  className="af-check absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                  aria-hidden
                >
                  ✓
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 슬롯 */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold">🔧 {ui.slotsLabel}</span>
          <span className="af-pill text-[11px] tabular-nums">
            {game.equipped.length} / {game.slots}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {Array.from({ length: game.slots }).map((_, i) => {
            const card = game.equippedCards.find((c) => c.id === game.equipped[i]);
            return (
              <button
                key={i}
                type="button"
                disabled={!card || testing}
                onClick={() => card && handleToggle(card.id)}
                className={cn(
                  "flex min-h-[3.25rem] flex-1 basis-[8rem] items-center gap-2 rounded-2xl border-2 px-3 py-2 text-left transition-all",
                  card ? "af-slot-filled" : "af-slot-empty",
                )}
              >
                {card ? (
                  <>
                    <span className="text-xl" aria-hidden>
                      {card.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-extrabold">{card.name}</span>
                      <span className="text-[10px] text-muted-foreground">빼기 ✕</span>
                    </span>
                  </>
                ) : (
                  <span className="w-full text-center text-[11px] font-bold text-muted-foreground/70">
                    ＋ {ui.emptySlotLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 시험 버튼 */}
      <div className="mt-4">
        <button
          type="button"
          disabled={!canTest}
          onClick={() => {
            if (!canTest) return;
            testedSnapshot.current = game.equipped;
            setTesting(true);
          }}
          className={cn(
            "w-full px-6 py-3 text-sm font-bold",
            canTest ? "af-btn animate-pop" : "cursor-not-allowed rounded-xl bg-muted text-muted-foreground",
          )}
        >
          {testing ? `⏳ ${ui.testingLine}` : firstTest ? `🧪 ${ui.testButtonFirst}` : `🔄 ${ui.testButton}`}
        </button>
      </div>

      {/* 6/6 달성 배너 — 달성 상태면 언제나 통찰로 갈 수 있게 남겨 둔다 */}
      {game.solved && !testing && (
        <div className="af-solved af-bounce-in mt-3 rounded-2xl p-4 text-center">
          <div className="text-3xl" aria-hidden>
            🎉
          </div>
          <p className="mt-1 text-sm font-black text-foreground">{ui.solvedBanner}</p>
          <button
            type="button"
            onClick={game.goInsight}
            className="af-btn mt-3 w-full px-6 py-3 text-sm"
          >
            {ui.toInsightButton}
          </button>
        </div>
      )}

      {/* 시험 결과 공개 (아직 6/6이 아닐 때) */}
      <AnimatePresence>
        {showReveal && game.lastTest && !game.solved && !testing && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3"
          >
            <div className="mlq-card p-3.5">
                {game.lastTest.newlyEnabledIds.length > 0 && (
                  <div>
                    <div className="text-xs font-extrabold text-foreground/80">
                      ✨ {ui.newlyLabel}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {game.lastTest.newlyEnabledIds.map((id) => {
                        const u = users.find((x) => x.id === id);
                        if (!u) return null;
                        return (
                          <span key={id} className="af-tag-on rounded-full px-2 py-0.5 text-[11px] font-bold">
                            {u.emoji} {u.who}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                {game.lastTest.blockedIds.length > 0 && (
                  <div className="mt-2.5">
                    <div className="text-xs font-extrabold text-foreground/80">
                      🔎 {ui.stillBlockedLabel}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {game.lastTest.blockedIds.map((id) => {
                        const u = users.find((x) => x.id === id);
                        if (!u) return null;
                        return (
                          <span key={id} className="af-tag-off rounded-full px-2 py-0.5 text-[11px] font-bold">
                            {u.emoji} {u.who}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                {game.lastTest.slotGrew && (
                  <p className="mt-2.5 rounded-lg bg-accent/20 px-3 py-2 text-[11px] font-semibold text-accent-foreground">
                    🔓 {ui.slotGrowLine}
                  </p>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 개선 카드 트레이 */}
      <div className="mt-5">
        <div className="text-sm font-extrabold">🃏 {ui.trayTitle}</div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{ui.trayGuide}</p>
        {slotsFull && (
          <p className="mt-1 text-[11px] font-semibold text-foreground/70">💡 {ui.equipHint}</p>
        )}
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {improvements.map((imp) => {
            const isEquipped = game.equipped.includes(imp.id);
            const locked = !isEquipped && slotsFull;
            const helps = helpedBy(imp);
            const revealed = revealedCardIds.has(imp.id);
            return (
              <button
                key={imp.id}
                type="button"
                disabled={testing || locked}
                onClick={() => handleToggle(imp.id)}
                aria-pressed={isEquipped}
                className={cn(
                  "af-cardbtn relative rounded-2xl border-2 bg-card p-3 text-left transition-all",
                  isEquipped ? "af-cardbtn-on" : "hover:border-primary/30",
                  locked && "opacity-45",
                )}
                style={{ "--tile-hue": 95 } as CSSProperties}
              >
                <div className="flex items-center gap-2">
                  <span className="mlq-emoji-tile h-9 w-9 shrink-0 text-lg" aria-hidden>
                    {imp.emoji}
                  </span>
                  <span className="text-sm font-extrabold leading-tight">{imp.name}</span>
                  {isEquipped && (
                    <span className="af-check ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white" aria-hidden>
                      ✓
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{imp.desc}</p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-foreground/70">
                  {revealed ? (
                    <>
                      <span>{ui.helpsLabel}:</span>
                      {helps.length > 0 ? (
                        <span className="text-base leading-none" aria-hidden>
                          {helps.map((h) => h.emoji).join(" ")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/70">{ui.helpsNoneLabel}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground/70">{ui.helpsHiddenLabel}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

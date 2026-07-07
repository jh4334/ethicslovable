/**
 * 1단계 · 자유 뽑기 체험 — '전설의 수호자' 아이템 상점.
 * 확률은 비공개("?%")이고, 뽑기 연출(흔들림→빛기둥→카드 공개)과
 * 아쉬움(니어미스) 연출까지 실제 상술 그대로 재현한다. 이 화면에서
 * 겪는 모든 것이 3단계 '상술 해부'의 재료가 된다.
 *
 * Math.random()은 game.draw() 안에서만, 그리고 클릭 핸들러에서만 실행된다.
 * 연출 타이머는 결과를 바꾸지 않는다 — 결과는 버튼을 누른 순간 이미 확정.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GbContent, GbRarity, PullRecord } from "../types";
import type { GachaGame } from "../useGachaGame";
import { formatCoins } from "../format";

interface ShopScreenProps {
  content: GbContent;
  game: GachaGame;
}

type AnimStage = "idle" | "shake" | "beam" | "flash" | "reveal";

interface AnimState {
  stage: AnimStage;
  record: PullRecord | null;
}

export default function ShopScreen({ content, game }: ShopScreenProps) {
  const { shop, nearMiss } = content;
  const [anim, setAnim] = useState<AnimState>({ stage: "idle", record: null });
  const timersRef = useRef<number[]>([]);

  // 화면을 떠날 때 남은 연출 타이머 정리
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const schedule = useCallback((ms: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  const rarityByKey = useMemo(() => {
    const map = new Map<string, GbRarity>();
    for (const rarity of content.rarities) map.set(rarity.key, rarity);
    return map;
  }, [content.rarities]);

  const animating = anim.stage === "shake" || anim.stage === "beam" || anim.stage === "flash";
  // 연출이 끝나기 전에는 방금 뽑기를 수첩·인벤토리에 미리 보여 주지 않는다 (스포 방지)
  const visiblePulls = animating ? game.pulls.slice(0, -1) : game.pulls;
  const outOfCoins = game.coins < shop.gachaPrice;

  const handleDraw = () => {
    if (animating) return;
    const record = game.draw(); // 결과는 이 순간 확정 — 연출은 보여 주기일 뿐
    if (!record) return;
    setAnim({ stage: "shake", record });
    schedule(900, () => setAnim({ stage: "beam", record }));
    if (record.nearMiss) {
      // 아쉬움 연출: 금빛으로 번쩍였다가 → 보라(희귀)로 가라앉는다
      schedule(1600, () => setAnim({ stage: "flash", record }));
      schedule(2900, () => setAnim({ stage: "reveal", record }));
    } else {
      schedule(1600, () => setAnim({ stage: "reveal", record }));
    }
  };

  const revealRarity = anim.record ? rarityByKey.get(anim.record.rarityKey) : undefined;
  const legendaryColor = rarityByKey.get("legendary")?.color ?? "#f59e0b";

  return (
    <div className="mx-auto w-full max-w-md px-4 py-5 pb-10">
      {/* 상점 상단 바 — 상점 이름 + 보유 코인 */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-muted-foreground">🏪 {shop.shopName}</span>
        <span className="gb-pill text-sm tabular-nums" aria-label={shop.coinLabel}>
          💰 {formatCoins(game.coins)}
        </span>
      </div>

      {/* 화려한 뽑기 배너 — 확률은 '?%'로 꽁꽁 숨겨져 있다(장치 ①) */}
      <div className="gb-banner mt-3 p-4 text-center">
        <div className="text-xl font-black tracking-tight">{shop.bannerTitle}</div>
        <p className="mt-0.5 text-xs font-bold">
          {shop.itemEmoji} {shop.bannerSub}
        </p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/40 px-3 py-1 text-xs font-extrabold">
          {shop.priceLine}
        </div>
        <p className="mt-1.5 text-[10px] font-semibold opacity-60">{shop.probabilityHidden}</p>
      </div>

      {/* 뽑기 무대 — 상자 / 빛기둥 / 결과 카드 */}
      <div className="relative mt-4 flex h-52 items-center justify-center overflow-hidden rounded-2xl border bg-card shadow-soft">
        {/* 빛기둥 — transform은 CSS 애니메이션이 쓰므로 margin(mx-auto)으로 가운데 정렬 */}
        {(anim.stage === "beam" || anim.stage === "flash" || anim.stage === "reveal") && (
          <div className="gb-beam absolute inset-x-0 bottom-0 mx-auto h-full w-24" aria-hidden />
        )}

        {/* 결과 카드 뒤 방사형 글로우 — 등급 색으로 은은하게 */}
        {anim.stage === "reveal" && revealRarity && (
          <div
            className="gb-glow absolute inset-0 m-auto h-52 w-52 rounded-full"
            style={{ color: revealRarity.color }}
            aria-hidden
          />
        )}

        <AnimatePresence mode="wait">
          {(anim.stage === "idle" || anim.stage === "shake" || anim.stage === "beam") && (
            <motion.div
              key="box"
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              className="relative flex flex-col items-center"
            >
              <span
                className={cn(
                  "text-7xl",
                  anim.stage === "idle" && "gb-box-idle",
                  (anim.stage === "shake" || anim.stage === "beam") && "gb-box-shake",
                )}
                aria-hidden
              >
                🎁
              </span>
              <p className="mt-2 text-xs font-bold text-muted-foreground">
                {anim.stage === "idle" ? `${shop.itemEmoji} ${shop.itemName}에 도전!` : shop.drawingLine}
              </p>
            </motion.div>
          )}

          {/* 아쉬움 연출 — 금빛으로 번쩍! (결과는 이미 희귀로 확정돼 있다) */}
          {anim.stage === "flash" && (
            <motion.div
              key="flash"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="gb-nearmiss-flash flex h-36 w-32 flex-col items-center justify-center rounded-2xl border-2 bg-card"
              style={{ borderColor: legendaryColor, background: `${legendaryColor}1f` }}
            >
              <span className="text-4xl" aria-hidden>
                ✨
              </span>
              <p className="mt-2 text-lg font-black" style={{ color: legendaryColor }}>
                {nearMiss.flashLine}
              </p>
            </motion.div>
          )}

          {/* 결과 카드 공개 */}
          {anim.stage === "reveal" && anim.record && revealRarity && (
            <motion.div
              key={`reveal-${anim.record.index}`}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center"
            >
              <div
                className="gb-bounce-in flex h-32 w-32 flex-col items-center justify-center rounded-2xl border-2"
                style={{
                  borderColor: revealRarity.color,
                  background: `${revealRarity.color}17`,
                  boxShadow: `0 0 22px ${revealRarity.color}55`,
                }}
              >
                <span className="text-4xl" aria-hidden>
                  {anim.record.item.emoji}
                </span>
                <span
                  className="mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-black text-white"
                  style={{ backgroundColor: revealRarity.color }}
                >
                  {revealRarity.label}
                </span>
                <p className="mt-1 px-1 text-center text-xs font-extrabold">{anim.record.item.name}</p>
              </div>
              {anim.record.nearMiss && (
                <p className="mt-2 max-w-[16rem] text-center text-[11px] font-bold text-muted-foreground">
                  {nearMiss.revealLine}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 코인 소진 안내 */}
      {outOfCoins && !animating && (
        <div className="gb-callout mt-3 rounded-2xl p-3 text-center text-xs font-bold leading-relaxed">
          {shop.noCoinsLine}
        </div>
      )}

      {/* 뽑기 / 그만 조사하기 — '그만'은 언제나 보인다 */}
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleDraw}
          disabled={animating || outOfCoins}
          className="gb-btn w-full px-6 py-3.5 text-base"
        >
          {animating ? shop.drawingLine : shop.drawButton}
        </button>
        <button
          type="button"
          onClick={game.stopShopping}
          className={cn(
            "w-full rounded-xl px-6 py-3 text-sm font-bold transition-colors",
            outOfCoins
              ? "mlq-gradient text-white shadow-glow"
              : "border bg-card text-foreground hover:bg-muted",
          )}
        >
          {shop.stopButton}
        </button>
      </div>

      {/* 조사 수첩 — 등급별 누적 카운트 */}
      <div className="mlq-card mt-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold">{shop.recordTitle}</h2>
          <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
            {shop.recordPullsLabel} {visiblePulls.length} / {game.maxPulls} · {shop.recordSpentLabel}{" "}
            {formatCoins(visiblePulls.length * shop.gachaPrice)}
          </span>
        </div>
        <div className="mt-2.5 grid grid-cols-4 gap-1.5">
          {content.rarities.map((rarity) => {
            const count = visiblePulls.filter((p) => p.rarityKey === rarity.key).length;
            return (
              <div
                key={rarity.key}
                className="flex flex-col items-center rounded-xl border py-1.5"
                style={{ borderColor: `${rarity.color}66`, background: `${rarity.color}0f` }}
              >
                <span className="text-[10px] font-extrabold" style={{ color: rarity.color }}>
                  ● {rarity.label}
                </span>
                <span className="text-sm font-black tabular-nums">{count}회</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 인벤토리 */}
      <div className="mlq-card mt-3 p-4">
        <h2 className="text-xs font-extrabold">{shop.inventoryTitle}</h2>
        {visiblePulls.length === 0 ? (
          <p className="mt-2 text-[11px] font-semibold text-muted-foreground">{shop.inventoryEmpty}</p>
        ) : (
          <div className="mt-2.5 grid grid-cols-5 gap-1.5">
            {visiblePulls.map((pull) => {
              const rarity = rarityByKey.get(pull.rarityKey);
              return (
                <div
                  key={pull.index}
                  title={`${rarity?.label ?? ""} · ${pull.item.name}`}
                  className="gb-pop-in flex aspect-square items-center justify-center rounded-xl border-2 bg-card text-2xl"
                  style={{ borderColor: rarity?.color ?? "#ccc", background: `${rarity?.color ?? "#cccccc"}12` }}
                >
                  <span aria-hidden>{pull.item.emoji}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

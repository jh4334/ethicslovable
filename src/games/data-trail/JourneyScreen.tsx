/**
 * 파트 B — 데이터의 여행 추적 (핵심).
 * 수집→저장→분석→프로필→맞춤 광고 5개 역을 세로 스텝퍼로 하나씩 밝히며,
 * 파트 A에서 플레이어가 실제로 남긴 행동 기록으로 모든 역의 내용을 그린다.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ACTION_EMOJI, ACTION_LABELS, formatElapsed } from "./logic";
import ProfileCard from "./ProfileCard";
import type { DtContent, DtStation } from "./types";
import type { DataTrailGame } from "./useDataTrailGame";

interface JourneyScreenProps {
  content: DtContent;
  game: DataTrailGame;
}

export default function JourneyScreen({ content, game }: JourneyScreenProps) {
  const { stations, journey } = content;
  const { log, analysis, goProtect } = game;

  const [visibleCount, setVisibleCount] = useState(1);
  const [revealedAds, setRevealedAds] = useState<number[]>([]);
  const lastStationRef = useRef<HTMLLIElement | null>(null);

  const atLastStation = visibleCount >= stations.length;

  // 새 역이 열리면 그 역으로 부드럽게 스크롤
  useEffect(() => {
    if (visibleCount > 1) {
      lastStationRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
  }, [visibleCount]);

  const revealAd = (index: number) => {
    setRevealedAds((prev) => (prev.includes(index) ? prev : [...prev, index]));
  };

  const renderStationBody = (station: DtStation) => {
    switch (station.id) {
      /* ① 수집 — 실제 행동 기록을 그대로 나열 */
      case "collect":
        return (
          <ul className="mt-3 space-y-1.5">
            {log.map((action, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs"
              >
                <span>{ACTION_EMOJI[action.kind]}</span>
                <span className="font-semibold">{ACTION_LABELS[action.kind]}</span>
                <span className="truncate text-muted-foreground">{action.target}</span>
              </li>
            ))}
          </ul>
        );

      /* ② 저장 — 데이터 창고: 구조화된 표 */
      case "store":
        return (
          <div className="dt-table mt-3 overflow-x-auto">
            <table className="w-full min-w-[26rem] text-xs">
              <thead>
                <tr className="bg-muted text-left text-muted-foreground">
                  <th className="px-3 py-2 font-semibold">시간</th>
                  <th className="px-3 py-2 font-semibold">행동</th>
                  <th className="px-3 py-2 font-semibold">대상</th>
                  <th className="px-3 py-2 font-semibold">태그</th>
                </tr>
              </thead>
              <tbody>
                {log.map((action, i) => (
                  <tr key={i} className="border-t bg-card">
                    <td className="whitespace-nowrap px-3 py-1.5 text-muted-foreground">
                      {formatElapsed(action.atSec)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5">
                      {ACTION_EMOJI[action.kind]} {ACTION_LABELS[action.kind]}
                    </td>
                    <td className="px-3 py-1.5">{action.target}</td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-muted-foreground">
                      {action.tags.map((t) => `#${t}`).join(" ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      /* ③ 분석 — 태그를 센 실제 횟수로 관심사 순위 막대 */
      case "analyze": {
        const maxCount = analysis.ranking[0]?.count ?? 1;
        const medals = ["🥇", "🥈", "🥉"];
        return (
          <div className="mt-3 space-y-2">
            {analysis.ranking.map((entry, i) => (
              <div key={entry.tag} className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 truncate font-semibold">
                  {medals[i] ?? "·"} #{entry.tag}
                </span>
                <div className="dt-bar-track flex-1">
                  <div
                    className="dt-bar-fill"
                    style={{ width: `${(entry.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-muted-foreground">
                  {entry.count}번
                </span>
              </div>
            ))}
          </div>
        );
      }

      /* ④ 프로필 — AI가 추측한 나(데이터 그림자) 카드 */
      case "profile":
        return (
          <div className="mt-3">
            <ProfileCard content={content} profile={analysis.profile} />
          </div>
        );

      /* ⑤ 맞춤 광고 — 상위 태그가 고른 광고 3장, 이유는 눌러서 확인 */
      case "ads":
        return (
          <div className="mt-3 space-y-2.5">
            {analysis.ads.map((ad, i) => {
              const revealed = revealedAds.includes(i);
              return (
                <div
                  key={ad.title}
                  className={cn(
                    "dt-ad-card rounded-xl p-3.5",
                    revealed && ad.isBait && "dt-ad-bait-revealed",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ad.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        광고
                      </p>
                      <p className="text-sm font-bold leading-snug">{ad.title}</p>
                      <p className="text-xs text-muted-foreground">{ad.line}</p>
                    </div>
                  </div>
                  {revealed ? (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "mt-2.5 rounded-lg px-3 py-2 text-xs font-semibold leading-relaxed",
                        ad.isBait ? "dt-ad-reason-bait" : "dt-ad-reason",
                      )}
                    >
                      {ad.isBait ? "🚨 " : "💡 "}
                      {ad.reason}
                    </motion.p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => revealAd(i)}
                      className="dt-btn dt-btn-outline mt-2.5 w-full px-3 py-1.5 text-xs"
                    >
                      🤔 {content.adSection.question} · {content.adSection.revealButton}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className="dt-screen">
      <div className="container max-w-2xl py-6">
        <h2 className="text-xl font-extrabold">🗺️ {journey.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{journey.subtitle}</p>

        <ol className="mt-6">
          <AnimatePresence initial={false}>
            {stations.slice(0, visibleCount).map((station, index) => {
              const isLast = index === visibleCount - 1;
              return (
                <motion.li
                  key={station.id}
                  ref={isLast ? lastStationRef : undefined}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="flex gap-3 scroll-mt-16"
                >
                  {/* 왼쪽: 역 번호 점 + 점선 경로 */}
                  <div className="flex flex-col items-center">
                    <span className="dt-station-dot">{station.emoji}</span>
                    {index < stations.length - 1 && <span className="dt-connector" />}
                  </div>

                  {/* 오른쪽: 역 카드 */}
                  <div
                    className={cn(
                      "dt-station-card mb-5 flex-1 rounded-2xl bg-card p-4",
                      isLast && "dt-station-current",
                    )}
                  >
                    <p className="dt-accent-text text-[11px] font-bold">
                      {index + 1}번째 역
                    </p>
                    <h3 className="text-base font-extrabold">{station.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {station.explanation}
                    </p>
                    {renderStationBody(station)}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>

        <div className="pb-8 pl-12">
          {atLastStation ? (
            <button
              type="button"
              onClick={goProtect}
              className="dt-btn dt-btn-primary w-full px-6 py-3 text-sm"
            >
              🛡️ {journey.doneButton}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setVisibleCount((n) => Math.min(n + 1, stations.length))}
              className="dt-btn dt-btn-primary w-full px-6 py-3 text-sm"
            >
              {journey.nextButton} ↓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

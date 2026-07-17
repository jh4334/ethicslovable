import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Award, Lock, Printer } from "lucide-react";
import { CHAPTERS, GAMES } from "./games";
import { getProgress, completedCount, GAME_IDS } from "@/lib/progress";
import { getCertName, saveCertName } from "@/lib/certificate";
import { cn } from "@/lib/utils";

/** 차시별 포인트 색상(hue) — 포털과 동일하게 맞춰 배지 타일에 사용 */
const LESSON_HUES = [252, 199, 320, 262, 152, 33, 217, 174, 340, 45, 210, 130, 200, 95, 285, 20];

/**
 * 배지 컬렉션 + 수료증.
 * - 각 차시를 완료하면 배지가 켜지고, 부(챕터)를 모두 깨면 부 배지가 빛난다.
 * - 완주(또는 진행) 상황을 담아 인쇄할 수 있는 수료증을 제공한다.
 * - 별명은 이 컴퓨터(localStorage)에만 저장하며 서버로 보내지 않는다.
 */
export default function CertificatePage() {
  const progress = useMemo(() => getProgress(), []);
  const done = completedCount();
  const total = GAME_IDS.length;
  const allDone = done === total;

  const [name, setName] = useState(getCertName);
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleName = (v: string) => {
    setName(v);
    saveCertName(v);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* 화면 상단 바 — 인쇄 시 숨김 */}
      <div className="cert-noprint border-b bg-card/80 backdrop-blur">
        <div className="container flex items-center justify-between gap-3 py-3">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> 퀘스트 지도로
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="mlq-btn-primary inline-flex min-h-[44px] items-center gap-1.5 px-4 py-2 text-sm font-bold"
          >
            <Printer className="h-4 w-4" /> 수료증 인쇄
          </button>
        </div>
      </div>

      <main className="container py-8">
        {/* 배지 컬렉션 — 인쇄 시 숨김 */}
        <section className="cert-noprint mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-black">나의 배지 컬렉션</h1>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">
            차시를 완료할 때마다 배지가 켜져요. {total}개 중{" "}
            <b className="text-foreground">{done}개</b>를 모았어요!
          </p>

          {CHAPTERS.map((ch) => {
            const chapterGames = GAMES.filter((g) => g.chapter === ch.chapter);
            const chapterDone = chapterGames.filter((g) => progress.games[g.id]).length;
            const chapterAll = chapterDone === chapterGames.length;
            return (
              <div key={ch.chapter} className="mb-6">
                <div className="mb-2.5 flex items-center gap-2">
                  <h2 className="text-sm font-extrabold">{ch.title}</h2>
                  <span
                    className={cn(
                      "mlq-chip",
                      chapterAll ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {chapterAll ? "✨ 완주" : `${chapterDone}/${chapterGames.length}`}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {chapterGames.map((game) => {
                    const earned = Boolean(progress.games[game.id]);
                    const hue = LESSON_HUES[(game.lesson - 1) % LESSON_HUES.length];
                    return (
                      <Link
                        key={game.id}
                        to={game.path}
                        title={`${game.lesson}차시 ${game.title}${earned ? " · 완료" : ""}`}
                        className={cn(
                          "mlq-card flex flex-col items-center gap-1 p-3 text-center transition-transform hover:-translate-y-0.5",
                          earned ? "ring-2 ring-success/40" : "opacity-70",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "mlq-emoji-tile h-12 w-12 text-2xl",
                            !earned && "grayscale",
                          )}
                          style={{ "--tile-hue": hue } as React.CSSProperties}
                        >
                          {earned ? game.emoji : <Lock className="h-5 w-5 text-muted-foreground" />}
                        </span>
                        <span className="text-[11px] font-bold leading-tight">
                          {game.lesson}차시
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* 수료증 — 인쇄 대상 */}
        <section className="cert-print-area mx-auto max-w-2xl">
          <div className="cert-sheet relative overflow-hidden rounded-3xl border-4 border-primary/25 bg-card p-8 text-center shadow-lift sm:p-12">
            {/* 장식 */}
            <span aria-hidden className="pointer-events-none absolute left-5 top-5 text-3xl opacity-20">🔍</span>
            <span aria-hidden className="pointer-events-none absolute right-5 top-5 text-3xl opacity-20">🏆</span>
            <span aria-hidden className="pointer-events-none absolute bottom-5 left-5 text-3xl opacity-20">🫧</span>
            <span aria-hidden className="pointer-events-none absolute bottom-5 right-5 text-3xl opacity-20">🌱</span>

            <p className="mlq-gradient-text text-sm font-black tracking-widest">MEDIA LITERACY QUEST</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              {allDone ? "수 료 증" : "도전 확인증"}
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-primary/40" />

            <div className="mt-8">
              <label className="cert-noprint text-xs font-bold text-muted-foreground">
                별명을 적어 주세요 (이 컴퓨터에만 저장돼요)
              </label>
              <input
                value={name}
                onChange={(e) => handleName(e.target.value)}
                placeholder="예) 알고리즘 탐정 김누리"
                maxLength={20}
                className="cert-name-input mx-auto mt-1.5 block w-full max-w-sm border-b-2 border-primary/30 bg-transparent px-2 py-1.5 text-center text-2xl font-black focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-sm font-bold text-muted-foreground">위 어린이는</p>
            </div>

            <p className="mx-auto mt-4 max-w-md text-base font-bold leading-relaxed sm:text-lg">
              미디어 리터러시 퀘스트{" "}
              <b className="mlq-gradient-text">전체 {total}차시 중 {done}차시</b>를
              {allDone ? " 모두 완주하여" : " 씩씩하게 도전하여"}
              <br />
              추천 알고리즘·인공지능·디지털 시민성·AI 윤리를 슬기롭게 배웠기에
              <br />이 증서를 드립니다.
            </p>

            {/* 부별 완주 도장 */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {CHAPTERS.map((ch) => {
                const g = GAMES.filter((x) => x.chapter === ch.chapter);
                const cAll = g.every((x) => progress.games[x.id]);
                return (
                  <span
                    key={ch.chapter}
                    className={cn(
                      "rounded-full border-2 px-3 py-1 text-xs font-black",
                      cAll
                        ? "border-success/50 bg-success/10 text-success"
                        : "border-muted-foreground/20 text-muted-foreground",
                    )}
                  >
                    {cAll ? "✔ " : "· "}
                    {ch.chapter}부
                  </span>
                );
              })}
            </div>

            <p className="mt-8 text-sm font-bold">{today}</p>
            <p className="mt-1 text-lg font-black">🔍 미디어 리터러시 퀘스트</p>
          </div>

          <p className="cert-noprint mt-4 text-center text-xs text-muted-foreground">
            인쇄 버튼을 누르거나 브라우저의 인쇄(Ctrl/⌘+P)로 수료증만 깔끔하게 뽑을 수 있어요.
          </p>
        </section>
      </main>
    </div>
  );
}

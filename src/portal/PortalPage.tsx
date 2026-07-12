import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { CHAPTERS, GAMES } from "./games";
import { getProgress, resetProgress, completedCount, GAME_IDS } from "@/lib/progress";
import { cn } from "@/lib/utils";

/** 차시별 포인트 색상(hue) — 이모지 타일·차시 배지에 사용 */
const LESSON_HUES = [252, 199, 320, 262, 152, 33, 217, 174, 340, 45, 210, 130, 200, 95, 285, 20];

export default function PortalPage() {
  const [progress, setProgress] = useState(getProgress);
  const done = completedCount();
  const total = GAME_IDS.length;

  const handleReset = () => {
    if (window.confirm("진행 기록을 모두 지울까요? (이 컴퓨터에서만 지워져요)")) {
      resetProgress();
      setProgress(getProgress());
    }
  };

  return (
    <div className="min-h-screen">
      {/* 히어로 — 퀘스트 그라디언트 + 떠다니는 이모지 */}
      <header className="mlq-gradient relative overflow-hidden text-white">
        <span aria-hidden className="animate-float absolute left-[6%] top-10 text-4xl opacity-40 sm:text-5xl">🫧</span>
        <span aria-hidden className="animate-float absolute right-[8%] top-16 text-4xl opacity-40 [animation-delay:1.2s] sm:text-5xl">🔮</span>
        <span aria-hidden className="animate-float absolute bottom-8 left-[16%] text-3xl opacity-30 [animation-delay:2s]">🕵️</span>
        <span aria-hidden className="animate-float absolute bottom-12 right-[18%] text-3xl opacity-30 [animation-delay:0.6s]">🧙</span>
        <div className="container relative py-12 text-center sm:py-16">
          <p className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm sm:text-sm">
            <Sparkles className="h-3.5 w-3.5" />
            초등 5~6학년 미디어·AI 리터러시 수업 패키지
          </p>
          <h1 className="mt-4 text-4xl font-black drop-shadow-sm sm:text-5xl">
            🔍 미디어 리터러시 퀘스트
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed opacity-95 sm:text-base">
            인터넷 세상 '누리마을'의 IT 회사 <b>누리소프트</b>에 새내기 알고리즘
            요원으로 입사했어요. 16개의 퀘스트를 차례대로 깨면서 추천 알고리즘과
            인공지능의 비밀을 파헤쳐 보세요. 설치도, 로그인도 필요 없어요!
          </p>
        </div>
        <svg aria-hidden className="block w-full text-background" viewBox="0 0 1440 48" fill="currentColor" preserveAspectRatio="none">
          <path d="M0,24 C240,48 480,0 720,12 C960,24 1200,48 1440,16 L1440,48 L0,48 Z" />
        </svg>
      </header>

      <main className="container py-8">
        {/* 진행 현황 */}
        <div className="mlq-card mb-10 flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="text-lg font-extrabold">나의 퀘스트 진행</h2>
            <p className="text-sm text-muted-foreground">
              {done === total ? "모든 퀘스트 완료! 🎉" : `${total}개 중 ${done}개 완료`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3.5 w-40 overflow-hidden rounded-full bg-muted sm:w-56">
              <div
                className="mlq-gradient h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max((done / total) * 100, done > 0 ? 8 : 0)}%` }}
              />
            </div>
            <span className="text-sm font-black tabular-nums">{done}/{total}</span>
            {done > 0 && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                title="진행 기록 지우기"
              >
                <RotateCcw className="h-3 w-3" />
                기록 지우기
              </button>
            )}
          </div>
        </div>

        {CHAPTERS.map((ch) => {
          const chapterGames = GAMES.filter((g) => g.chapter === ch.chapter);
          const chapterDone = chapterGames.filter((g) => progress.games[g.id]).length;
          return (
            <section key={ch.chapter} className="mb-12">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <h2 className="mlq-gradient-text text-2xl font-black">{ch.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{ch.tagline}</p>
                </div>
                <span
                  className={cn(
                    "mlq-chip shrink-0",
                    chapterDone === chapterGames.length
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {chapterDone === chapterGames.length && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {chapterDone}/{chapterGames.length} 완료
                </span>
              </div>
              <ol className="grid gap-5 sm:grid-cols-2">
                {chapterGames.map((game) => {
                  const record = progress.games[game.id];
                  const completed = Boolean(record);
                  const hue = LESSON_HUES[(game.lesson - 1) % LESSON_HUES.length];
                  return (
                    <li key={game.id}>
                      <Link
                        to={game.path}
                        className={cn(
                          "mlq-card mlq-card-hover group relative block h-full overflow-hidden p-5",
                          completed && "ring-2 ring-success/35"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <span
                            aria-hidden
                            className="mlq-emoji-tile h-16 w-16 shrink-0 text-4xl transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3"
                            style={{ "--tile-hue": hue } as React.CSSProperties}
                          >
                            {game.emoji}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              {/* 글자용 색은 명도를 낮춰 흰 카드 위 대비 4.5:1 이상 확보 */}
                              <p className="text-xs font-extrabold" style={{ color: `hsl(${hue} 65% 32%)` }}>
                                {game.lesson}차시 · {game.subtitle}
                              </p>
                              {completed ? (
                                <span className="mlq-chip bg-success/10 text-success">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> 완료
                                </span>
                              ) : (
                                <span className="mlq-chip bg-muted font-semibold text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" /> {game.minutes}분
                                </span>
                              )}
                            </div>
                            <h3 className="mt-1.5 text-xl font-extrabold transition-colors group-hover:text-primary">
                              {game.title}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              {game.goal}
                            </p>
                          </div>
                        </div>
                        {record?.summary && (
                          <p className="mt-3 rounded-xl bg-muted/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                            🏅 지난 기록: {record.summary}
                          </p>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}

        <div className="mlq-card p-5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2 font-bold text-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            안심하고 사용하세요
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>로그인·회원가입이 없고, 어떤 개인정보도 서버로 보내지 않아요.</li>
            <li>진행 기록은 지금 쓰는 컴퓨터(브라우저)에만 저장돼요.</li>
            <li>게임 속 SNS·인공지능·인물·게시물은 모두 교육용으로 만든 가상의 이야기예요.</li>
          </ul>
        </div>

        <footer className="mt-8 pb-4 text-center text-xs font-medium text-muted-foreground">
          미디어 리터러시 퀘스트 — 교육용 무료 배포 자료
        </footer>
      </main>
    </div>
  );
}

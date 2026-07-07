import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Lock, RotateCcw, ShieldCheck } from "lucide-react";
import { GAMES } from "./games";
import { getProgress, resetProgress, completedCount } from "@/lib/progress";
import { cn } from "@/lib/utils";

export default function PortalPage() {
  const [progress, setProgress] = useState(getProgress);
  const done = completedCount();

  const handleReset = () => {
    if (window.confirm("진행 기록을 모두 지울까요? (이 컴퓨터에서만 지워져요)")) {
      resetProgress();
      setProgress(getProgress());
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground">
        <div className="container py-10 text-center">
          <p className="text-sm font-medium opacity-80">초등 5~6학년 미디어 리터러시 수업 패키지</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">🔍 미디어 리터러시 퀘스트</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-90 sm:text-base">
            인터넷 세상 '누리마을'의 IT 회사 <b>누리소프트</b>에 새내기 알고리즘
            요원으로 입사했어요. 4개의 퀘스트를 차례대로 깨면서 추천 알고리즘의
            비밀을 파헤쳐 보세요. 설치도, 로그인도 필요 없어요!
          </p>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">나의 퀘스트 진행</h2>
            <p className="text-sm text-muted-foreground">
              {done === 4 ? "모든 퀘스트 완료! 🎉" : `4개 중 ${done}개 완료`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-36 overflow-hidden rounded-full bg-muted sm:w-48">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${(done / 4) * 100}%` }}
              />
            </div>
            {done > 0 && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                title="진행 기록 지우기"
              >
                <RotateCcw className="h-3 w-3" />
                기록 지우기
              </button>
            )}
          </div>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2">
          {GAMES.map((game) => {
            const record = progress.games[game.id];
            const completed = Boolean(record);
            return (
              <li key={game.id}>
                <Link
                  to={game.path}
                  className={cn(
                    "group block h-full rounded-xl border bg-card p-5 shadow-sm transition",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    completed && "border-success/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">{game.emoji}</span>
                    {completed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" /> 완료
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> 약 {game.minutes}분
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-xs font-semibold text-primary">
                    {game.lesson}차시 · {game.subtitle}
                  </p>
                  <h3 className="mt-1 text-lg font-bold group-hover:text-primary">
                    {game.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{game.goal}</p>
                  {record?.summary && (
                    <p className="mt-2 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                      지난 기록: {record.summary}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            안심하고 사용하세요
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>로그인·회원가입이 없고, 어떤 개인정보도 서버로 보내지 않아요.</li>
            <li>진행 기록은 지금 쓰는 컴퓨터(브라우저)에만 저장돼요.</li>
            <li>게임 속 SNS·인물·게시물은 모두 교육용으로 만든 가상의 이야기예요.</li>
          </ul>
        </div>

        <footer className="mt-8 flex items-center justify-center gap-2 pb-4 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>미디어 리터러시 퀘스트 — 교육용 무료 배포 자료</span>
        </footer>
      </main>
    </div>
  );
}

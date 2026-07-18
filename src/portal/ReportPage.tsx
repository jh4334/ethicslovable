import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer, ShieldCheck } from "lucide-react";
import { CHAPTERS, GAMES } from "./games";
import { getProgress, completedCount, GAME_IDS } from "@/lib/progress";

/**
 * 교사용 학습 기록 리포트 — 이 기기(브라우저)에 저장된 진행 상황을 표로 정리해
 * 인쇄·투사할 수 있게 한다. 서버·로그인이 없으므로 '이 기기의 기록'이며,
 * 공용 PC라면 그 브라우저를 쓴 사람들의 기록이 함께 담긴다(개인정보는 없음).
 */
export default function ReportPage() {
  const progress = useMemo(() => getProgress(), []);
  const done = completedCount();
  const total = GAME_IDS.length;
  const today = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fmtDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* 상단 바 — 인쇄 시 숨김 */}
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
            <Printer className="h-4 w-4" /> 리포트 인쇄
          </button>
        </div>
      </div>

      <main className="container cert-print-area py-8">
        <header className="mb-5">
          <h1 className="text-2xl font-black">학습 기록 리포트</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            이 기기 기준 · {today} 현재 · 전체 <b className="text-foreground">{done}/{total}</b>{" "}
            차시 완료
          </p>
        </header>

        {/* 부별 요약 */}
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CHAPTERS.map((ch) => {
            const g = GAMES.filter((x) => x.chapter === ch.chapter);
            const d = g.filter((x) => progress.games[x.id]).length;
            return (
              <div key={ch.chapter} className="mlq-card p-3 text-center">
                <p className="text-xs font-bold text-muted-foreground">{ch.chapter}부</p>
                <p className="mt-1 text-lg font-black tabular-nums">
                  {d}/{g.length}
                </p>
              </div>
            );
          })}
        </div>

        {/* 차시별 표 */}
        <div className="mlq-card overflow-x-auto p-0">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs font-bold text-muted-foreground">
                <th className="px-3 py-2">차시</th>
                <th className="px-3 py-2">게임</th>
                <th className="px-3 py-2 text-center">상태</th>
                <th className="px-3 py-2 text-center">완료일</th>
                <th className="px-3 py-2 text-center">최고점수</th>
                <th className="px-3 py-2">지난 기록</th>
              </tr>
            </thead>
            <tbody>
              {GAMES.map((game) => {
                const rec = progress.games[game.id];
                const completed = Boolean(rec);
                return (
                  <tr key={game.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-bold tabular-nums">{game.lesson}</td>
                    <td className="px-3 py-2">
                      <span aria-hidden className="mr-1">{game.emoji}</span>
                      {game.title}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {completed ? (
                        <span className="font-bold text-success">✓ 완료</span>
                      ) : (
                        <span className="text-muted-foreground">· 미완료</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums text-muted-foreground">
                      {fmtDate(rec?.completedAt)}
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums">
                      {rec?.bestScore !== undefined ? rec.bestScore.toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {rec?.summary ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="cert-noprint mt-6 mlq-card p-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-2 font-bold text-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            읽는 방법
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>이 표는 <b>지금 쓰는 기기(브라우저)</b>에 저장된 기록이에요. 서버로 보내지 않아요.</li>
            <li>공용 PC라면 그 브라우저를 사용한 학생들의 기록이 함께 담겨요. 학생별로 나누려면 기기마다 인쇄하세요.</li>
            <li>포털의 <b>기록 지우기</b>로 이 기기 기록을 초기화할 수 있어요(다음 학급 사용 전 권장).</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl">🧭</p>
      <h1 className="text-2xl font-bold">길을 잃었어요!</h1>
      <p className="text-muted-foreground">찾으시는 페이지가 없어요.</p>
      <Link
        to="/"
        className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
      >
        퀘스트 지도로 돌아가기
      </Link>
    </div>
  );
}

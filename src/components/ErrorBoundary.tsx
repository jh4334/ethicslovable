import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** 오류가 난 자리에 대신 보여 줄 내용 (없으면 기본 안내) */
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * 렌더 중 예외가 나도 앱 전체가 하얗게 죽지 않도록 감싸는 안전망.
 * 게임 하나의 버그가 포털·다른 게임까지 무너뜨리지 않게, 각 게임 라우트를
 * 이 경계로 감싼다. (콘텐츠 편집 실수·예상 밖 데이터에 대한 최후 방어)
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 서버 전송 없이 콘솔에만 남긴다 (개인정보·네트워크 원칙 유지)
    console.error("게임에서 문제가 발생했어요:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-5xl" aria-hidden>
          🛠️
        </div>
        <div>
          <p className="text-lg font-black">이 게임에서 문제가 생겼어요</p>
          <p className="mt-1 text-sm text-muted-foreground">
            잠깐 문제가 있었어요. 새로고침하거나 퀘스트 지도로 돌아가 다시 시도해 주세요.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mlq-btn-primary px-5 py-2.5 text-sm font-bold"
          >
            새로고침
          </button>
          <a
            href="#/"
            className="rounded-xl border bg-card px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            퀘스트 지도로
          </a>
        </div>
      </div>
    );
  }
}

/**
 * 12차시 · 단톡방을 지켜라
 * 플레이어는 메신저 '누리톡'의 우리 반 단톡방 멤버이자 누리마을 지킴이가 되어,
 * 아침부터 밤까지 하루 동안 벌어지는 5개 에피소드(루머·피싱 링크·저격·
 * 사진 무단 공유·심야 도배)에 슬기롭게 대응한다.
 * 핵심 배움: 단톡방에서의 디지털 시민성 — 확인하고, 알리고, 동조하지 않고,
 * 허락을 구하고, 시간을 지키는 것. 12차시 전체 여정의 마무리(공동체).
 * 콘텐츠(에피소드·선택지·약속 후보)는 src/content/chat-guard.json 에서 분리 관리.
 */
import { useEffect, useState } from "react";
import GameLayout from "@/components/GameLayout";
import { loadContent } from "@/lib/content";
import fallbackContent from "@/content/chat-guard.json";
import type { CgContent } from "./types";
import { useChatGuardGame } from "./useChatGuardGame";
import StartScreen from "./components/StartScreen";
import ChatScreen from "./components/ChatScreen";
import PromiseScreen from "./components/PromiseScreen";
import FinaleScreen from "./components/FinaleScreen";
import "./styles.css";

function GameBody({ content }: { content: CgContent }) {
  const game = useChatGuardGame(content);

  if (game.phase === "chat") return <ChatScreen content={content} game={game} />;
  if (game.phase === "promise") return <PromiseScreen content={content} game={game} />;
  if (game.phase === "finale") return <FinaleScreen content={content} game={game} />;
  return <StartScreen content={content} onStart={game.start} />;
}

export default function ChatGuardGame() {
  const [content, setContent] = useState<CgContent | null>(null);

  useEffect(() => {
    let alive = true;
    loadContent<CgContent>("chat-guard", fallbackContent as unknown as CgContent).then(
      (loaded) => {
        if (alive) setContent(loaded);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <GameLayout gameId="chat-guard" lesson={12} title="단톡방을 지켜라">
      {content ? (
        <GameBody content={content} />
      ) : (
        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center text-sm text-muted-foreground">
          단톡방에 입장하는 중이에요…
        </div>
      )}
    </GameLayout>
  );
}

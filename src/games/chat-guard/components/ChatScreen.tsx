import { useEffect, useMemo, useRef } from "react";
import { ArrowRight, ChevronLeft, Menu, Plus, Search, Send, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CgChoice, CgContent, CgEpisode, CgMember, CgQuality } from "../types";
import type { ChatGuardGame } from "../useChatGuardGame";
import { clockAfter } from "../useChatGuardGame";

// 색만 다른 하트(💚💛❤️)는 색각이상 학생에게 구분되지 않으므로
// '모양이 다른' 기호를 쓴다.
const QUALITY_EMOJI: Record<CgQuality, string> = {
  wise: "✅",
  soso: "⚠️",
  risky: "⛔",
};

interface ChatScreenProps {
  content: CgContent;
  game: ChatGuardGame;
}

/** 이름 → 멤버 매핑용 아바타 */
function Avatar({ member }: { member?: CgMember }) {
  return (
    <span className="cg-avatar" aria-hidden>
      {member?.emoji ?? "🙂"}
    </span>
  );
}

/** 왼쪽(친구) 말풍선 */
function FriendMessage({
  member,
  name,
  text,
  sticker,
  photo,
  time,
  showHeader,
}: {
  member?: CgMember;
  name: string;
  text: string;
  sticker?: string;
  photo?: string;
  time: string;
  showHeader: boolean;
}) {
  return (
    <div className={cn("cg-msg flex items-start gap-2", showHeader ? "mt-3" : "mt-1")}>
      {showHeader ? <Avatar member={member} /> : <span className="w-[2.1rem] shrink-0" />}
      <div className="min-w-0 max-w-[76%]">
        {showHeader && (
          <p className="mb-0.5 text-[11px] font-bold text-muted-foreground">{name}</p>
        )}
        {photo ? (
          <div className="cg-photo">
            <div className="cg-photo-frame" aria-hidden>
              {photo}
            </div>
            <p className="px-2.5 py-1.5 text-[13px] leading-snug">{text}</p>
          </div>
        ) : sticker ? (
          <div>
            <div className="cg-sticker" aria-hidden>
              {sticker}
            </div>
            {text && (
              <div className="cg-bubble-friend mt-1 inline-block px-3 py-2 text-sm leading-relaxed">
                {text}
              </div>
            )}
          </div>
        ) : (
          <div className="cg-bubble-friend inline-block px-3 py-2 text-sm leading-relaxed">
            {text}
          </div>
        )}
      </div>
      <span className="cg-time self-end pb-0.5">{time}</span>
    </div>
  );
}

/** 오른쪽(내) 말풍선 — 읽음 숫자 "1" 포함 */
function MyMessage({ text, time }: { text: string; time: string }) {
  return (
    <div className="cg-msg mt-3 flex items-end justify-end gap-1.5">
      <div className="flex flex-col items-end gap-0.5">
        <span className="cg-unread">1</span>
        <span className="cg-time">{time}</span>
      </div>
      <div className="cg-bubble-mine max-w-[76%] px-3 py-2 text-sm font-medium leading-relaxed">
        {text}
      </div>
    </div>
  );
}

/** 괄호 선택지(행동)를 골랐을 때 — 말풍선 대신 가운데 안내 문구 */
function ActionNote({ text }: { text: string }) {
  return (
    <div className="cg-msg mt-3 flex justify-center">
      <span className="cg-action-note rounded-full px-3 py-1 text-[11px] font-bold">
        ⭐ 나 · {text.replace(/^\(|\)$/g, "")}
      </span>
    </div>
  );
}

/** "○○ 입력 중…" 타이핑 인디케이터 */
function TypingIndicator({ member, name, suffix }: { member?: CgMember; name?: string; suffix: string }) {
  return (
    <div className="cg-msg mt-3 flex items-start gap-2">
      <Avatar member={member} />
      <div>
        {name && (
          <p className="mb-0.5 text-[11px] font-bold text-muted-foreground">
            {name} <span className="font-medium">{suffix}</span>
          </p>
        )}
        <div className="cg-bubble-friend cg-typing-dots inline-flex items-center px-3 py-2.5">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

/** 지킴이 판정 카드 (💚/💛/❤️) */
function VerdictCard({
  choice,
  title,
  badgeEarned,
}: {
  choice: CgChoice;
  title: string;
  badgeEarned: string;
}) {
  return (
    <div className={cn("cg-verdict mt-4 rounded-2xl p-3.5", `cg-verdict-${choice.quality}`)}>
      <p className="mb-1.5 flex items-center gap-1.5 text-sm font-extrabold">
        <span className="text-base" aria-hidden>
          {QUALITY_EMOJI[choice.quality]}
        </span>
        {title}
      </p>
      <p className="text-[13px] leading-relaxed text-foreground/85">{choice.feedback}</p>
      {choice.quality === "wise" && (
        <span className="cg-badge-earn mt-2.5 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black">
          🛡️ {badgeEarned}
        </span>
      )}
    </div>
  );
}

/** 시간대 구분선 */
function Divider({ label }: { label: string }) {
  return (
    <div className="my-4 flex justify-center first:mt-0">
      <span className="cg-divider rounded-full px-3 py-1 text-[11px] font-bold">{label}</span>
    </div>
  );
}

export default function ChatScreen({ content, game }: ChatScreenProps) {
  const { labels } = content;
  const memberMap = useMemo(() => {
    const map: Record<string, CgMember> = {};
    content.members.forEach((m) => (map[m.name] = m));
    return map;
  }, [content.members]);

  const currentEp = content.episodes[game.epIndex];
  const isLastEp = game.epIndex >= content.episodes.length - 1;

  // 선택지 순서를 에피소드마다 섞는다 (wise가 늘 첫 번째가 되지 않게)
  const choiceOrder = useMemo(() => {
    const arr = currentEp ? currentEp.choices.map((_, i) => i) : [];
    for (let k = arr.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [arr[k], arr[j]] = [arr[j], arr[k]];
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.epIndex, currentEp]);

  // 새 말풍선·판정이 나올 때마다 맨 아래로 스크롤
  const feedRef = useRef<HTMLDivElement>(null);
  const feedKey = `${game.epIndex}/${game.revealed}/${game.reactRevealed}/${game.stage}/${game.typing}`;
  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [feedKey]);

  /** 에피소드 하나를 채팅 피드 블록으로 렌더 */
  const renderEpisode = (ep: CgEpisode, i: number) => {
    if (i > game.epIndex) return null;
    const isCurrent = i === game.epIndex;
    const chosenIdx = game.results[i];
    const choice = chosenIdx == null ? null : ep.choices[chosenIdx];

    const msgCount =
      isCurrent && game.stage === "intro" ? game.revealed : ep.messages.length;
    const reactCount = !choice
      ? 0
      : isCurrent && game.stage === "reacting"
        ? game.reactRevealed
        : choice.reactions.length;
    const showVerdict = Boolean(choice) && (!isCurrent || game.stage === "verdict");

    const typerName =
      isCurrent && game.typing
        ? game.stage === "intro"
          ? ep.messages[game.revealed]?.sender
          : choice?.reactions[game.reactRevealed]?.sender
        : undefined;

    const isAction = choice ? choice.text.trim().startsWith("(") : false;
    const myTime = clockAfter(ep.clock, ep.messages.length + 1);

    return (
      <div key={ep.id}>
        <Divider label={ep.timeLabel} />

        {ep.messages.slice(0, msgCount).map((msg, j) => (
          <FriendMessage
            key={j}
            member={memberMap[msg.sender]}
            name={msg.sender}
            text={msg.text}
            sticker={msg.sticker}
            photo={msg.photo}
            time={clockAfter(ep.clock, j)}
            showHeader={j === 0 || ep.messages[j - 1].sender !== msg.sender}
          />
        ))}

        {choice &&
          (isAction ? <ActionNote text={choice.text} /> : <MyMessage text={choice.text} time={myTime} />)}

        {choice &&
          choice.reactions.slice(0, reactCount).map((r, k) => (
            <FriendMessage
              key={`r${k}`}
              member={memberMap[r.sender]}
              name={r.sender}
              text={r.text}
              time={clockAfter(ep.clock, ep.messages.length + 2 + k)}
              showHeader={k === 0 || choice.reactions[k - 1].sender !== r.sender}
            />
          ))}

        {typerName && (
          <TypingIndicator
            member={memberMap[typerName]}
            name={typerName}
            suffix={labels.typingSuffix}
          />
        )}

        {showVerdict && choice && (
          <VerdictCard
            choice={choice}
            title={labels.verdictTitles[choice.quality]}
            badgeEarned={labels.badgeEarned}
          />
        )}
      </div>
    );
  };

  return (
    <div className="cg-shell flex h-[calc(100vh-3rem)] flex-col items-center px-2 pb-2 pt-3 sm:px-4">
      {/* 진행 상태 스트립 — 에피소드 점 + 배지 수 */}
      <div className="mb-2 flex w-full max-w-md items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-extrabold text-muted-foreground">
            {labels.episodeLabel} {game.epIndex + 1}/{content.episodes.length}
          </span>
          <div className="flex items-center gap-1">
            {content.episodes.map((_, i) => {
              const q = game.qualities[i];
              return (
                <span
                  key={i}
                  title={q === "wise" ? "현명" : q === "soso" ? "보통" : q === "risky" ? "위험" : undefined}
                  className={cn(
                    // 색만이 아니라 '모양'으로도 구분 (색각이상 배려):
                    // 현명=원 · 보통=테두리 원 · 위험=사각형
                    "cg-ep-dot h-2.5 w-2.5",
                    q === "wise" && "rounded-full bg-success",
                    q === "soso" && "rounded-full border-2 border-warning bg-transparent",
                    q === "risky" && "rounded-[2px] bg-destructive",
                    q == null && i === game.epIndex && "cg-ep-dot-current rounded-full bg-success/50",
                    q == null && i !== game.epIndex && "rounded-full bg-foreground/15",
                  )}
                />
              );
            })}
          </div>
        </div>
        <span className="cg-badge-chip inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold">
          🛡️ {labels.badgeLabel} {game.badges}
        </span>
      </div>

      {/* 폰 프레임 — 누리톡 단톡방 */}
      <div className="cg-phone flex w-full max-w-md flex-1 flex-col overflow-hidden">
        {/* 상단 방 제목 바 */}
        <header className="cg-room-header flex items-center gap-1.5 px-2.5 py-2.5">
          <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold leading-tight">
              {content.roomTitle}{" "}
              <span className="font-bold text-muted-foreground">{content.memberCount}</span>
            </p>
            <p className="text-[10px] font-medium text-muted-foreground">
              누리톡 · {currentEp?.title ?? ""}
            </p>
          </div>
          <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" aria-hidden />
          <Menu className="ml-1 h-[18px] w-[18px] shrink-0 text-muted-foreground" aria-hidden />
        </header>

        {/* 채팅 영역 */}
        <div ref={feedRef} className="cg-feed flex-1 overflow-y-auto px-3 pb-4 pt-3">
          <Divider label={`${labels.dateDivider} · 누리마을 지킴이의 하루`} />
          {content.episodes.map(renderEpisode)}
        </div>

        {/* 선택 패널 — 당신의 차례예요 */}
        {game.stage === "choice" && currentEp && (
          <div className="cg-choice-panel max-h-[46%] overflow-y-auto p-3">
            <p className="mb-0.5 flex items-center gap-1.5 text-sm font-black text-success">
              ✋ {labels.yourTurn}
            </p>
            <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
              {currentEp.prompt} <span className="font-bold">{labels.chooseHint}</span>
            </p>
            <div className="flex flex-col gap-1.5">
              {choiceOrder.map((ci) => (
                <button
                  key={ci}
                  onClick={() => game.choose(ci)}
                  className="cg-choice-btn w-full rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold leading-relaxed"
                >
                  {currentEp.choices[ci].text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 판정 후 — 다음 이야기 버튼 */}
        {game.stage === "verdict" && (
          <div className="cg-choice-panel p-3">
            <button
              onClick={game.next}
              className="cg-btn-cta flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-extrabold"
            >
              {isLastEp ? labels.makePromise : labels.nextEpisode}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 하단 입력바 (장식 — 실제 입력은 선택지로) */}
        <div className="cg-inputbar flex items-center gap-2 px-2.5 py-2">
          <Plus className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="cg-input-fake flex min-w-0 flex-1 items-center justify-between gap-2 rounded-full px-3 py-1.5">
            <span className="truncate text-xs">{labels.inputPlaceholder}</span>
            <Smile className="h-4 w-4 shrink-0" aria-hidden />
          </div>
          <span className="cg-send-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
            <Send className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
}

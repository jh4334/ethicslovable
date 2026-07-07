/**
 * 누리숏 피드 체험 — 폰 프레임 속 세로 숏폼 영상 화면.
 * - 위로 스와이프(드래그)·마우스 휠·버튼으로 다음 영상 (슬라이드 업 전환)
 * - 우측 세로 액션 레일(하트·말풍선·공유·북마크), 하단 @계정·캡션·🎵 사운드
 * - 화면에 시계·카운터를 일부러 보여 주지 않는다(교육 장치)
 * - 시간 퀴즈 오버레이 + 멈추기 챌린지 배너(다크패턴 체험: 그만 보기는 작게)
 */
import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, ChevronUp, Heart, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { fill, formatCount } from "./logic";
import type { SfContent, SfVideo } from "./types";
import type { ShortFormGame } from "./useShortFormGame";

interface FeedScreenProps {
  content: SfContent;
  game: ShortFormGame;
}

/** 영상 한 편 — 그라디언트 배경 + 이모지 장면 + 레일 + 캡션 (통째로 슬라이드) */
function VideoCard({
  video,
  liked,
  onLike,
  jackpotBadge,
}: {
  video: SfVideo;
  liked: boolean;
  onLike: () => void;
  jackpotBadge: string;
}) {
  const hue = video.bgHue;
  const likeCount = video.likeSeed + (liked ? 1 : 0);

  return (
    <div
      className={cn("sf-video", video.isJackpot && "sf-jackpot")}
      style={{
        backgroundImage: video.isJackpot
          ? `radial-gradient(38rem 24rem at 50% 30%, hsl(${hue} 95% 62%), transparent 70%), linear-gradient(165deg, hsl(${hue} 90% 55%), hsl(${(hue + 60) % 360} 80% 38%) 60%, hsl(${(hue + 100) % 360} 70% 24%))`
          : `linear-gradient(165deg, hsl(${hue} 80% 58%), hsl(${hue} 70% 32%) 62%, hsl(${(hue + 40) % 360} 55% 20%))`,
      }}
    >
      {video.isJackpot && <div aria-hidden className="sf-jackpot-rays" />}

      {video.isJackpot && (
        <span className="sf-jackpot-badge absolute top-14 left-1/2 z-20 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-black">
          {jackpotBadge}
        </span>
      )}

      <span aria-hidden className="sf-video-emoji relative z-10">
        {video.emoji}
      </span>

      {/* 좋아요 순간 하트 팡 — liked가 될 때 한 번만 재생 */}
      {liked && (
        <span aria-hidden className="sf-heart-burst">
          ❤️
        </span>
      )}

      {/* 우측 세로 액션 레일 */}
      <div className="sf-rail">
        <button
          type="button"
          onClick={onLike}
          className={cn("sf-rail-btn", liked && "sf-rail-liked")}
          aria-label="좋아요"
        >
          <span className="sf-rail-icon">
            <Heart className={cn("h-5 w-5", liked && "fill-current")} />
          </span>
          {formatCount(likeCount)}
        </button>
        <span className="sf-rail-btn" role="presentation">
          <span className="sf-rail-icon">
            <MessageCircle className="h-5 w-5" />
          </span>
          {formatCount(Math.round(video.likeSeed / 9))}
        </span>
        <span className="sf-rail-btn" role="presentation">
          <span className="sf-rail-icon">
            <Send className="h-5 w-5" />
          </span>
          {formatCount(Math.round(video.likeSeed / 22))}
        </span>
        <span className="sf-rail-btn" role="presentation">
          <span className="sf-rail-icon">
            <Bookmark className="h-5 w-5" />
          </span>
          {formatCount(Math.round(video.likeSeed / 14))}
        </span>
      </div>

      {/* 하단 좌측: 계정 · 캡션 · 사운드 */}
      <div className="sf-caption">
        <p className="text-sm font-extrabold">{video.account}</p>
        <p className="mt-0.5 text-xs leading-snug">{video.caption}</p>
        <p className="sf-sound mt-1.5 text-[10px] font-semibold">🎵 {video.sound}</p>
      </div>
    </div>
  );
}

export default function FeedScreen({ content, game }: FeedScreenProps) {
  const { feedUi, timeQuiz, stopChallenge } = content;
  const {
    current,
    pos,
    likedCurrent,
    quiz,
    alarmLevel,
    swipeNext,
    likeCurrent,
    answerQuiz,
    closeQuiz,
    stopNow,
  } = game;

  // 마우스 휠 연타 방지 — 한 번에 한 영상씩만 넘어가게 잠깐 잠근다
  const lastWheelRef = useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 24) return;
    const now = Date.now();
    if (now - lastWheelRef.current < 500) return;
    lastWheelRef.current = now;
    swipeNext();
  };

  const banner =
    alarmLevel >= 0
      ? stopChallenge.banners[Math.min(alarmLevel, stopChallenge.banners.length - 1)]
      : null;

  return (
    <div className="sf-screen py-5">
      <div className="container flex max-w-md flex-col items-center gap-3">
        <p className="text-center text-xs font-semibold text-muted-foreground">
          {feedUi.swipeHint}
        </p>

        {/* 폰 프레임 */}
        <div className="sf-phone">
          <div className="sf-phone-screen" onWheel={handleWheel}>
            <div aria-hidden className="sf-notch" />
            <div className="sf-tabs">
              <span>{feedUi.tabFollowing}</span>
              <span className="sf-tab-on">{feedUi.tabForYou}</span>
            </div>

            {/* 영상 — 위로 슬라이드 전환 */}
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={pos}
                className="absolute inset-0"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                drag={quiz ? false : "y"}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.5, bottom: 0.08 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y < -70 || info.velocity.y < -600) swipeNext();
                }}
              >
                <VideoCard
                  video={current}
                  liked={likedCurrent}
                  onLike={likeCurrent}
                  jackpotBadge={feedUi.jackpotBadge}
                />
              </motion.div>
            </AnimatePresence>

            {/* 멈추기 챌린지 배너 — 넘길수록 커지고 요란해진다.
                다크패턴 체험: '다음 영상'은 크게, '그만 보기'는 작게 */}
            <AnimatePresence>
              {banner && !quiz && (
                <motion.div
                  key={`alarm-${Math.min(alarmLevel, 2)}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`sf-alarm sf-alarm-${Math.min(alarmLevel, 2)}`}
                >
                  <p
                    className={cn(
                      "font-black leading-snug",
                      alarmLevel >= 2 ? "text-lg" : alarmLevel === 1 ? "text-sm" : "text-xs",
                    )}
                  >
                    ⏰ {banner.title}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 leading-snug",
                      alarmLevel >= 2 ? "text-sm" : "text-[11px]",
                    )}
                  >
                    {banner.line}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={swipeNext}
                      className={cn(
                        "sf-btn sf-alarm-next flex-1",
                        alarmLevel >= 2 ? "px-4 py-3 text-base" : "px-3 py-2 text-sm",
                      )}
                    >
                      ▶ {stopChallenge.nextButton}
                    </button>
                    <button type="button" onClick={stopNow} className="sf-stop-link shrink-0">
                      {stopChallenge.stopButton}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 시간 퀴즈 인터럽트 — 화면이 어두워지며 시간 감각을 점검한다 */}
            <AnimatePresence>
              {quiz && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="sf-quiz-overlay"
                >
                  <motion.div
                    initial={{ scale: 0.92, y: 12 }}
                    animate={{ scale: 1, y: 0 }}
                    className="sf-quiz-card p-4"
                  >
                    <p className="sf-accent-text text-xs font-black">⏰ {timeQuiz.title}</p>
                    <p className="mt-1 text-sm font-extrabold leading-snug">
                      {timeQuiz.question}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {quiz.choices.map((min) => {
                        const answered = quiz.picked !== null;
                        const isActual = min === quiz.actualMin;
                        const isPicked = min === quiz.picked;
                        return (
                          <button
                            key={min}
                            type="button"
                            disabled={answered}
                            onClick={() => answerQuiz(min)}
                            className={cn(
                              "sf-quiz-choice px-2 py-2.5 text-sm",
                              answered && isActual && "sf-quiz-correct",
                              answered && isPicked && !isActual && "sf-quiz-wrong",
                              answered && !isActual && !isPicked && "sf-quiz-dim",
                            )}
                          >
                            {answered && isActual ? "✓ " : ""}
                            약 {min}
                            {timeQuiz.choiceSuffix}
                          </button>
                        );
                      })}
                    </div>

                    {quiz.picked !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3"
                      >
                        <p className="text-sm font-bold">
                          {quiz.picked === quiz.actualMin
                            ? fill(timeQuiz.correctText, { 실제: quiz.actualMin })
                            : fill(timeQuiz.wrongTemplate, { 실제: quiz.actualMin })}
                        </p>
                        <p className="mt-1.5 rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                          💡 {timeQuiz.lesson}
                        </p>
                        <button
                          type="button"
                          onClick={closeQuiz}
                          className="sf-btn sf-btn-primary mt-3 w-full px-4 py-2.5 text-sm"
                        >
                          {timeQuiz.continueButton}
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 폰 아래 넘기기 버튼 — 마우스만 있는 교실 PC용 */}
        <button
          type="button"
          onClick={swipeNext}
          disabled={Boolean(quiz)}
          className="sf-btn sf-btn-outline w-full max-w-[21rem] px-4 py-2.5 text-sm"
        >
          <ChevronUp className="h-4 w-4" />
          {feedUi.nextButton}
        </button>
      </div>
    </div>
  );
}

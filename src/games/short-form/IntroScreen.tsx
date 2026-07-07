/**
 * 인트로 — 지킴이 임무 소개.
 * 필수 노출 2가지: (1) 가상 시계 규칙("영상 하나 = 30초, 시계는 안 보여요")
 * (2) "딱 5분(가상)만 보기" 약속. CTA를 누르는 행동 자체가 약속이 된다.
 */
import { motion } from "framer-motion";
import { FastForward, Play } from "lucide-react";
import type { SfContent } from "./types";

interface IntroScreenProps {
  content: SfContent;
  onStart: () => void;
}

export default function IntroScreen({ content, onStart }: IntroScreenProps) {
  const { intro, feedUi } = content;

  return (
    <div className="sf-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mlq-card w-full max-w-xl p-6 sm:p-8"
      >
        <div className="flex flex-col items-center text-center">
          <span
            aria-hidden
            className="mlq-emoji-tile sf-hero-tile animate-float h-20 w-20 text-5xl"
          >
            📱
          </span>
          <p className="sf-accent-text mt-4 text-sm font-bold">
            {feedUi.appName} · 누리마을 지킴이 임무
          </p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{intro.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{intro.tagline}</p>
        </div>

        <div className="mt-5 space-y-3 text-sm leading-relaxed">
          {intro.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* 가상 시계 규칙 — 수업 시간 절약 장치, 반드시 노출 */}
        <div className="sf-clock-note mt-5 flex items-start gap-2 rounded-xl p-3.5 text-sm">
          <FastForward className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">{intro.virtualClockNotice}</p>
        </div>

        {/* 5분 약속 서약 */}
        <div className="sf-promise mt-4 rounded-xl px-4 py-3">
          <p className="text-center text-sm font-extrabold leading-relaxed">
            🤙 {intro.promiseLine}
          </p>
        </div>

        <ol className="mt-5 space-y-2">
          {intro.missionSteps.map((step) => (
            <li key={step.step} className="flex items-start gap-3 rounded-xl bg-muted/60 p-3">
              <span className="sf-step-dot">{step.step}</span>
              <div>
                <p className="text-sm font-bold">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.line}</p>
              </div>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={onStart}
          className="sf-btn sf-btn-primary mt-6 w-full px-6 py-3 text-base"
        >
          <Play className="h-4 w-4" />
          {intro.startButton}
        </button>
      </motion.div>
    </div>
  );
}

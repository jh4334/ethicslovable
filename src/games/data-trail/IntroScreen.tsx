/** 인트로 — 임무 소개 + "이 게임 안에서만 일어나는 흉내" 안내를 반드시 보여 준다. */
import { motion } from "framer-motion";
import { Lock, Play } from "lucide-react";
import type { DtContent } from "./types";

interface IntroScreenProps {
  content: DtContent;
  onStart: () => void;
}

export default function IntroScreen({ content, onStart }: IntroScreenProps) {
  const { meta } = content;

  return (
    <div className="dt-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl rounded-2xl bg-card p-6 shadow-lg sm:p-8"
      >
        <p className="text-sm font-semibold text-primary">
          {meta.appName} · {meta.roleName} 임무
        </p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">🧳 {meta.introTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{meta.introTagline}</p>

        <div className="mt-5 space-y-3 text-sm leading-relaxed">
          {meta.introBody.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* 게임 안에서만 흉내 낸다는 안내 — 필수 노출 */}
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-muted p-3.5 text-sm">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">{meta.simulationNotice}</p>
        </div>

        <ol className="mt-5 space-y-2">
          {meta.partLabels.map((part) => (
            <li key={part.step} className="flex items-start gap-3 rounded-xl border p-3">
              <span className="dt-station-dot text-sm font-bold">{part.step}</span>
              <div>
                <p className="text-sm font-bold">{part.title}</p>
                <p className="text-xs text-muted-foreground">{part.line}</p>
              </div>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={onStart}
          className="dt-btn dt-btn-primary mt-6 w-full px-6 py-3 text-base"
        >
          <Play className="h-4 w-4" />
          {meta.startButton}
        </button>
      </motion.div>
    </div>
  );
}

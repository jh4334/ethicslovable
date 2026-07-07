/**
 * "AI가 추측한 나" 카드 — 파트 B의 프로필 역과 결과 화면에서 재사용.
 * 반드시 '데이터로 만든 그림자'라는 주의 문구를 함께 보여 준다.
 */
import type { DtContent, DtProfileGuess } from "./types";

interface ProfileCardProps {
  content: DtContent;
  profile: DtProfileGuess;
}

export default function ProfileCard({ content, profile }: ProfileCardProps) {
  const { cardTitle, topLabel, shadowNote } = content.profile;

  return (
    <div className="dt-profile-card rounded-2xl p-4 shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-2xl">👤</span>
        <p className="text-sm font-extrabold">{cardTitle}</p>
      </div>

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide opacity-70">
        {topLabel}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {profile.top.length > 0 ? (
          profile.top.map((entry, i) => (
            <span
              key={entry.tag}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold"
            >
              {i + 1}위 · #{entry.tag} ({entry.count}번)
            </span>
          ))
        ) : (
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
            아직 데이터가 없어요
          </span>
        )}
      </div>

      <p className="mt-3 text-sm font-semibold leading-relaxed">“{profile.line}”</p>
      {profile.subLine && (
        <p className="mt-1 text-xs leading-relaxed opacity-80">{profile.subLine}</p>
      )}

      <p className="dt-shadow-note mt-4 rounded-lg px-3 py-2 text-xs font-semibold text-amber-100">
        ⚠️ {shadowNote}
      </p>
    </div>
  );
}

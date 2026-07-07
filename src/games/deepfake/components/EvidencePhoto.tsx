/**
 * 사진 증거 한 장 — svgs.tsx 의 그림을 액자에 담아 보여 준다.
 *
 * mode
 * - "view"   : 그냥 보여 주기 (판별 단계)
 * - "hunt"   : 단서 찾기 — 이상한 곳 위에 투명 클릭 영역을 깔고,
 *              빗나간 클릭은 onPick(null) 로 알린다. 기회는 한 번.
 * - "reveal" : 해설 단계 — 이상한 곳을 점선 테두리로 모두 공개한다.
 */
import { cn } from "@/lib/utils";
import type { DfAnomaly } from "../types";
import { getScene, type DfHotspot } from "../svgs";

interface EvidencePhotoProps {
  svgId: string;
  anomalies?: DfAnomaly[];
  mode: "view" | "hunt" | "reveal";
  /** reveal 모드에서 플레이어가 직접 찾아낸 곳 (초록 강조) */
  foundAnomalyId?: string | null;
  onPick?: (anomalyId: string | null) => void;
}

export default function EvidencePhoto({
  svgId,
  anomalies = [],
  mode,
  foundAnomalyId = null,
  onPick,
}: EvidencePhotoProps) {
  const scene = getScene(svgId);
  const spots: Array<{ anomaly: DfAnomaly; box: DfHotspot }> = [];
  for (const anomaly of anomalies) {
    const box = scene.hotspots[anomaly.id];
    if (box) spots.push({ anomaly, box });
  }

  return (
    <div className={cn("df-photo-frame", mode === "hunt" && "df-photo-hunting")}>
      <svg
        viewBox="0 0 200 150"
        className="block h-auto w-full"
        role="img"
        aria-label="사진 증거"
      >
        {scene.render()}

        {/* 단서 찾기: 배경 전체(빗나감) → 이상한 곳(적중) 순서로 클릭 영역 */}
        {mode === "hunt" && (
          <g>
            <rect
              x={0}
              y={0}
              width={200}
              height={150}
              fill="transparent"
              onClick={() => onPick?.(null)}
            />
            {spots.map(({ anomaly, box }) => (
              <rect
                key={anomaly.id}
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                fill="transparent"
                className="df-hotspot"
                onClick={(e) => {
                  e.stopPropagation();
                  onPick?.(anomaly.id);
                }}
              />
            ))}
          </g>
        )}

        {/* 해설: 이상한 곳을 모두 공개 */}
        {mode === "reveal" &&
          spots.map(({ anomaly, box }) => {
            const isFound = anomaly.id === foundAnomalyId;
            return (
              <rect
                key={anomaly.id}
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx={8}
                fill="none"
                stroke={isFound ? "hsl(152 60% 40%)" : "hsl(0 78% 58%)"}
                strokeWidth={2.5}
                strokeDasharray="6 4"
                className="df-anomaly-ring"
              />
            );
          })}
      </svg>
    </div>
  );
}

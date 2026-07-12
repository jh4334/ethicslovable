/**
 * 게임 콘텐츠 로더.
 *
 * 콘텐츠(가짜 피드·시나리오)는 코드와 분리된 JSON으로 관리한다.
 * - 원본: src/content/<name>.json (빌드 시 dist/data/<name>.json 으로 복사됨)
 * - 웹 서버 배포본에서는 data/<name>.json 을 텍스트 편집기로 고치면
 *   재빌드 없이 게임 내용이 바뀐다.
 * - 오프라인(file://)이나 네트워크 실패 시에는 번들에 포함된 기본
 *   콘텐츠(fallback)를 사용한다.
 * - 서버의 JSON이 앱 업데이트 이전 버전이라 '새로 생긴 문구 키'가 없을 때는
 *   내장 기본값으로 빈칸을 메운다(깊은 병합) — 재빌드 없이 데이터만 남은
 *   배포에서 빈 배너·빈 안내가 뜨지 않게 하는 방어다. 배열은 교사가 통째로
 *   편집하는 단위이므로 병합하지 않고 서버 값을 그대로 쓴다.
 */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** loaded에 없는 키를 fallback으로 채운다 (객체는 재귀, 배열·원시값은 loaded 우선) */
function fillMissing<T>(fallback: T, loaded: unknown): T {
  if (!isPlainObject(fallback) || !isPlainObject(loaded)) {
    return (loaded ?? fallback) as T;
  }
  const out: Record<string, unknown> = { ...loaded };
  for (const key of Object.keys(fallback)) {
    const fv = (fallback as Record<string, unknown>)[key];
    if (!(key in out) || out[key] == null) {
      out[key] = fv;
    } else if (isPlainObject(fv) && isPlainObject(out[key])) {
      out[key] = fillMissing(fv, out[key]);
    }
  }
  return out as T;
}

export async function loadContent<T>(name: string, fallback: T): Promise<T> {
  try {
    const url = `${import.meta.env.BASE_URL}data/${name}.json`;
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const loaded = await res.json();
    return fillMissing(fallback, loaded);
  } catch {
    return fallback;
  }
}

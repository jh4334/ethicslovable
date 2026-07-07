/**
 * 게임 콘텐츠 로더.
 *
 * 콘텐츠(가짜 피드·시나리오)는 코드와 분리된 JSON으로 관리한다.
 * - 원본: src/content/<name>.json (빌드 시 dist/data/<name>.json 으로 복사됨)
 * - 웹 서버 배포본에서는 data/<name>.json 을 텍스트 편집기로 고치면
 *   재빌드 없이 게임 내용이 바뀐다.
 * - 오프라인(file://)이나 네트워크 실패 시에는 번들에 포함된 기본
 *   콘텐츠(fallback)를 사용한다.
 */
export async function loadContent<T>(name: string, fallback: T): Promise<T> {
  try {
    const url = `${import.meta.env.BASE_URL}data/${name}.json`;
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

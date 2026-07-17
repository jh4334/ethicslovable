/**
 * 수료증에 쓰는 별명(닉네임) — 브라우저 localStorage에만 저장한다.
 * 실명이 아니라 학생이 정하는 별명이며, 서버로 보내지 않는다(개인정보 수집 없음).
 * 저장 실패(시크릿 모드 등)는 조용히 무시한다.
 */
const NAME_KEY = "mlq-name-v1";

export function getCertName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveCertName(name: string): void {
  try {
    const trimmed = name.trim();
    if (trimmed) localStorage.setItem(NAME_KEY, trimmed);
    else localStorage.removeItem(NAME_KEY);
  } catch {
    /* 저장 실패는 무시 */
  }
}

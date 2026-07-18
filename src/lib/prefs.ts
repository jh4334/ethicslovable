/**
 * 화면 표시 환경설정 — 글자 크기 등. 브라우저 localStorage에만 저장하며
 * 개인정보가 아니다. 저장 실패(시크릿 모드 등)는 조용히 무시한다.
 *
 * 글자 크기는 <html>의 기준 font-size(rem)를 키워, rem 기반인 앱 전체
 * 글자·간격이 함께 커지게 한다(저학년·저시력 학생을 위한 UDL 배려).
 */
export type FontScale = "normal" | "large" | "xlarge";

const FONT_KEY = "mlq-font-scale-v1";

/** 기준 16px 대비 배율 — 레이아웃이 깨지지 않는 온건한 범위 */
const SCALE_PX: Record<FontScale, string> = {
  normal: "100%",
  large: "112.5%",
  xlarge: "125%",
};

export function getFontScale(): FontScale {
  try {
    const v = localStorage.getItem(FONT_KEY);
    if (v === "normal" || v === "large" || v === "xlarge") return v;
  } catch {
    /* 무시 */
  }
  return "normal";
}

/** <html>에 배율을 적용한다. 저장 실패와 무관하게 적용은 항상 시도. */
export function applyFontScale(scale: FontScale): void {
  const el = document.documentElement;
  if (el) el.style.fontSize = SCALE_PX[scale];
}

export function setFontScale(scale: FontScale): void {
  applyFontScale(scale);
  try {
    if (scale === "normal") localStorage.removeItem(FONT_KEY);
    else localStorage.setItem(FONT_KEY, scale);
  } catch {
    /* 저장 실패는 무시(적용은 이미 됨) */
  }
}

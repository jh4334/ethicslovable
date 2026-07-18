import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { applyFontScale, getFontScale } from "./lib/prefs";

// 저장된 글자 크기를 첫 렌더 전에 적용해 화면 깜빡임(FOUC)을 막는다
applyFontScale(getFontScale());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

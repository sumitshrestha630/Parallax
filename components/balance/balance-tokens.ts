import type { CSSProperties } from "react";

/** Matches `components/ui/dashboard.tsx` pixel UI tokens */
export const PF = "'Press Start 2P', monospace";

export const PIXEL_BTN_STYLE = (
  bg = "#6ED640",
  border = "#3A9018",
  shadow = "#1E6010"
): CSSProperties => ({
  fontFamily: PF,
  fontSize: "9px",
  background: bg,
  border: `3px solid ${border}`,
  boxShadow: `0 4px 0 ${shadow}, 0 6px 0 rgba(0,0,0,0.4)`,
  padding: "10px 18px",
  color: bg === "#6ED640" ? "#0a1a06" : "#6ED640",
  cursor: "pointer",
});

export const HEADING_STYLE: CSSProperties = {
  fontFamily: PF,
  color: "#78E04A",
  textShadow: "2px 2px 0 #1E6010, 3px 3px 0 #0A3808",
};

export const LABEL_STYLE: CSSProperties = {
  fontFamily: PF,
  fontSize: "8px",
  color: "#6ED640",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
};

export const CARD_BG = "#060c18";
export const CARD_BORDER = "#1a2744";
export const PANEL_BG = "#04080e";

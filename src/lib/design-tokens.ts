/** SoT brand tokens — keep UI consistent across B2B (mobile) and Ops/Admin (desktop). */
export const tokens = {
  brand: {
    red: "#e31c24",
    redHover: "#c41820",
    ink: "#111111",
    muted: "#6b6b6b",
    border: "#e5e5e5",
    surface: "#ffffff",
    canvas: "#f6f6f6",
    softRed: "#fdecec",
  },
  radius: {
    card: "14px",
    control: "12px",
    pill: "9999px",
  },
  touch: {
    min: 44,
  },
  shadow: {
    card: "0 1px 2px rgba(17,17,17,0.04)",
  },
} as const;

export type BrandTokens = typeof tokens;

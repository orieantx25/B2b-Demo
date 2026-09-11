/** Shared drive links for partner marketing / training packs (stub URLs until real Drive API). */
export const PARTNER_DRIVE_MATERIALS = {
  marketing: {
    label: "Marketing material",
    url: "https://drive.google.com/drive/folders/ugsot-marketing-pack",
  },
  training: {
    label: "Training material",
    url: "https://drive.google.com/drive/folders/ugsot-training-pack",
  },
  reports: {
    label: "Report templates",
    url: "https://drive.google.com/drive/folders/ugsot-report-pack",
  },
} as const;

export type MaterialShareMode = "auto_signed" | "manual";

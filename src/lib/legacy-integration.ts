/** Legacy admin portal integration for UTM / Coupon create */

export type LegacyAction = "utm" | "child_utm" | "coupon";

export function buildLegacyUrl(
  baseUrl: string,
  action: LegacyAction,
  params: {
    consultantCode: string;
    consultantName?: string;
    counsellorCode?: string;
    parentUtmCode?: string;
    /** Extra form fields forwarded as query params (stub handoff). */
    fields?: Record<string, string>;
  }
) {
  const url = new URL(baseUrl);
  url.searchParams.set("source", "ugsot_portal");
  url.searchParams.set("action", action);
  url.searchParams.set("consultantCode", params.consultantCode);
  if (params.consultantName) url.searchParams.set("consultantName", params.consultantName);
  if (params.counsellorCode) url.searchParams.set("counsellorCode", params.counsellorCode);
  if (params.parentUtmCode) url.searchParams.set("parentUtmCode", params.parentUtmCode);
  if (params.fields) {
    for (const [k, v] of Object.entries(params.fields)) {
      if (v) url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

export function openLegacyPortal(url: string) {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

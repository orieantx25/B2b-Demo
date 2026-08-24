export type GeoTag = { lat: number; lng: number; label?: string; capturedAt: string };

const DEMO_GEO: GeoTag = {
  lat: 28.5355,
  lng: 77.391,
  label: "NCR (demo)",
  capturedAt: new Date().toISOString(),
};

/** Prefer device geolocation; fall back to demo NCR coords for the walkthrough. */
export async function captureGeo(): Promise<{ geo: GeoTag; demo: boolean }> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { geo: { ...DEMO_GEO, capturedAt: new Date().toISOString() }, demo: true };
  }
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 4000,
        maximumAge: 60_000,
      });
    });
    return {
      geo: {
        lat: Number(pos.coords.latitude.toFixed(5)),
        lng: Number(pos.coords.longitude.toFixed(5)),
        label: "Device location",
        capturedAt: new Date().toISOString(),
      },
      demo: false,
    };
  } catch {
    return { geo: { ...DEMO_GEO, capturedAt: new Date().toISOString() }, demo: true };
  }
}

export function formatGeo(geo: { lat: number; lng: number; label?: string }) {
  const coords = `${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}`;
  return geo.label ? `${geo.label} · ${coords}` : coords;
}

/** Read image file as data URL for demo persistence in sessionStorage. */
export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

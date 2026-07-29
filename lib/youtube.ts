export function getYouTubeVideoId(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v");
      }

      const [kind, videoId] = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(kind)) {
        return videoId ?? null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeStartSeconds(value: string) {
  try {
    const url = new URL(value);
    const rawStart = url.searchParams.get("t") ?? url.searchParams.get("start");
    if (!rawStart) return 0;
    if (/^\d+$/.test(rawStart)) return Number(rawStart);

    const hours = Number(rawStart.match(/(\d+)h/)?.[1] ?? 0);
    const minutes = Number(rawStart.match(/(\d+)m/)?.[1] ?? 0);
    const seconds = Number(rawStart.match(/(\d+)s/)?.[1] ?? 0);
    return hours * 3600 + minutes * 60 + seconds;
  } catch {
    return 0;
  }
}

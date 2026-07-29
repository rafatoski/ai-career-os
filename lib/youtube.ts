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

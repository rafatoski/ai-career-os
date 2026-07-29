"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock3 } from "lucide-react";

import { savePlaybackProgressAction } from "@/app/actions/learning";
import { Progress } from "@/components/ui/progress";
import { formatTimestamp } from "@/lib/utils";

type YouTubePlayerProps = {
  moduleSlug: string;
  lessonId: string;
  videoId: string;
  initialPosition: number;
  initialPercent: number;
};

type YouTubePlayerInstance = {
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
};

function getPlaybackSnapshot(player: YouTubePlayerInstance | null) {
  if (
    !player ||
    typeof player.getCurrentTime !== "function" ||
    typeof player.getDuration !== "function"
  ) {
    return null;
  }

  try {
    const position = player.getCurrentTime();
    const duration = player.getDuration();

    if (
      !Number.isFinite(position) ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return null;
    }

    return {
      position: Math.max(0, position),
      duration,
    };
  } catch {
    // The iframe API can invalidate the player before React runs cleanup.
    return null;
  }
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          width?: string | number;
          height?: string | number;
          videoId: string;
          host?: string;
          playerVars?: Record<string, number>;
          events: {
            onReady: (event: { target: YouTubePlayerInstance }) => void;
            onStateChange: (event: {
              data: number;
              target: YouTubePlayerInstance;
            }) => void;
          };
        },
      ) => YouTubePlayerInstance;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function YouTubePlayer({
  moduleSlug,
  lessonId,
  videoId,
  initialPosition,
  initialPercent,
}: YouTubePlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const playerReadyRef = useRef(false);
  const saveInFlightRef = useRef(false);
  const [position, setPosition] = useState(initialPosition);
  const [duration, setDuration] = useState(0);
  const [watchedPercent, setWatchedPercent] = useState(initialPercent);

  const persist = useCallback(
    async (ended = false) => {
      const player = playerRef.current;
      if (!playerReadyRef.current || saveInFlightRef.current) return;

      const snapshot = getPlaybackSnapshot(player);
      if (!snapshot) return;

      saveInFlightRef.current = true;

      try {
        const result = await savePlaybackProgressAction({
          moduleSlug,
          lessonId,
          position: snapshot.position,
          duration: snapshot.duration,
          ended,
        });
        setPosition(result.playbackSeconds);
        setWatchedPercent(result.watchedPercent);
        setDuration(snapshot.duration);
      } finally {
        saveInFlightRef.current = false;
      }
    },
    [lessonId, moduleSlug],
  );

  const sendBeacon = useCallback(() => {
    const player = playerRef.current;
    if (!playerReadyRef.current) return;

    const snapshot = getPlaybackSnapshot(player);
    if (!snapshot) return;

    const payload = JSON.stringify({
      moduleSlug,
      lessonId,
      position: snapshot.position,
      duration: snapshot.duration,
    });
    navigator.sendBeacon(
      "/api/progress/playback",
      new Blob([payload], { type: "application/json" }),
    );
  }, [lessonId, moduleSlug]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let disposed = false;
    let previousReady: (() => void) | undefined;
    let apiReadyHandler: (() => void) | undefined;
    const mountNode = mountRef.current;

    const createPlayer = () => {
      if (!mountNode || !window.YT || disposed) return;

      const playerHost = document.createElement("div");
      playerHost.className = "h-full w-full";
      mountNode.replaceChildren(playerHost);

      const player = new window.YT.Player(playerHost, {
        width: "100%",
        height: "100%",
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: ({ target }) => {
            if (disposed) {
              if (typeof target.destroy === "function") target.destroy();
              return;
            }

            playerRef.current = target;
            playerReadyRef.current = true;
            const snapshot = getPlaybackSnapshot(target);
            const videoDuration = snapshot?.duration ?? 0;
            setDuration(videoDuration);
            if (initialPosition > 2 && initialPosition < videoDuration - 5) {
              target.seekTo(initialPosition, true);
            }
            target.playVideo();
          },
          onStateChange: ({ data }) => {
            if (disposed || !playerReadyRef.current || !window.YT) return;
            if (data === window.YT.PlayerState.PAUSED) void persist();
            if (data === window.YT.PlayerState.ENDED) void persist(true);
          },
        },
      });
      playerRef.current = player;

      interval = setInterval(() => {
        const player = playerRef.current;
        if (
          !playerReadyRef.current ||
          !player ||
          !window.YT ||
          typeof player.getPlayerState !== "function"
        ) {
          return;
        }

        try {
          if (player.getPlayerState() !== window.YT.PlayerState.PLAYING) return;
        } catch {
          return;
        }

        const snapshot = getPlaybackSnapshot(player);
        if (!snapshot) return;

        setPosition(snapshot.position);
        setDuration(snapshot.duration);
        void persist();
      }, 10_000);
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]',
      );
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
      previousReady = window.onYouTubeIframeAPIReady;
      apiReadyHandler = () => {
        previousReady?.();
        createPlayer();
      };
      window.onYouTubeIframeAPIReady = apiReadyHandler;
    }

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") sendBeacon();
    };
    window.addEventListener("pagehide", sendBeacon);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      disposed = true;
      if (interval) clearInterval(interval);
      window.removeEventListener("pagehide", sendBeacon);
      document.removeEventListener("visibilitychange", handleVisibility);
      sendBeacon();
      playerReadyRef.current = false;

      if (apiReadyHandler && window.onYouTubeIframeAPIReady === apiReadyHandler) {
        window.onYouTubeIframeAPIReady = previousReady;
      }

      const player = playerRef.current;
      playerRef.current = null;
      if (player && typeof player.destroy === "function") {
        try {
          player.destroy();
        } catch {
          // The iframe may already have been removed by navigation.
        }
      }
      mountNode?.replaceChildren();
    };
  }, [initialPosition, persist, sendBeacon, videoId]);

  const livePercent = duration
    ? Math.max(watchedPercent, Math.round((position / duration) * 100))
    : watchedPercent;

  return (
    <div>
      <div className="aspect-video w-full overflow-hidden border-y border-white/[0.08] bg-black shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div ref={mountRef} className="h-full w-full" />
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 px-5 text-[11px] text-[#707681] sm:px-8 xl:px-10">
        <span className="flex items-center gap-1.5 tabular-nums">
          <Clock3 className="size-3.5" />
          {formatTimestamp(position)} / {formatTimestamp(duration)}
        </span>
        <span className="tabular-nums">{Math.min(100, livePercent)}% watched</span>
      </div>
      <Progress
        value={livePercent}
        className="mx-5 mt-2 w-auto sm:mx-8 xl:mx-10"
        label="Video watched"
      />
    </div>
  );
}

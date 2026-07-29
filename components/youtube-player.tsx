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

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
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
  const saveInFlightRef = useRef(false);
  const [position, setPosition] = useState(initialPosition);
  const [duration, setDuration] = useState(0);
  const [watchedPercent, setWatchedPercent] = useState(initialPercent);

  const persist = useCallback(
    async (ended = false) => {
      const player = playerRef.current;
      if (!player || saveInFlightRef.current) return;

      const currentPosition = player.getCurrentTime() || 0;
      const currentDuration = player.getDuration() || 1;
      saveInFlightRef.current = true;

      try {
        const result = await savePlaybackProgressAction({
          moduleSlug,
          lessonId,
          position: currentPosition,
          duration: currentDuration,
          ended,
        });
        setPosition(result.playbackSeconds);
        setWatchedPercent(result.watchedPercent);
        setDuration(currentDuration);
      } finally {
        saveInFlightRef.current = false;
      }
    },
    [lessonId, moduleSlug],
  );

  const sendBeacon = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    const currentPosition = player.getCurrentTime() || 0;
    const currentDuration = player.getDuration() || 1;
    const payload = JSON.stringify({
      moduleSlug,
      lessonId,
      position: currentPosition,
      duration: currentDuration,
    });
    navigator.sendBeacon(
      "/api/progress/playback",
      new Blob([payload], { type: "application/json" }),
    );
  }, [lessonId, moduleSlug]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let disposed = false;

    const createPlayer = () => {
      if (!mountRef.current || !window.YT || disposed) return;

      playerRef.current = new window.YT.Player(mountRef.current, {
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
            const videoDuration = target.getDuration() || 0;
            setDuration(videoDuration);
            if (initialPosition > 2 && initialPosition < videoDuration - 5) {
              target.seekTo(initialPosition, true);
            }
            target.playVideo();
          },
          onStateChange: ({ data }) => {
            if (!window.YT) return;
            if (data === window.YT.PlayerState.PAUSED) void persist();
            if (data === window.YT.PlayerState.ENDED) void persist(true);
          },
        },
      });

      interval = setInterval(() => {
        const player = playerRef.current;
        if (!player || !window.YT) return;
        if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
          setPosition(player.getCurrentTime() || 0);
          setDuration(player.getDuration() || 0);
          void persist();
        }
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
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        createPlayer();
      };
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
      playerRef.current?.destroy();
      playerRef.current = null;
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

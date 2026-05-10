"use client";

import "@livekit/components-styles";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

export const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
  const { user } = useUser();
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      user.id;

    const params = new URLSearchParams({ room: chatId, username: name });

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/livekit?${params.toString()}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Token request failed: ${res.status}`);
        }
        const data = (await res.json()) as { token: string };
        if (!cancelled) setToken(data.token);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load room");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, chatId]);

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-sm text-rose-500">{error}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Loader2 className="my-4 h-7 w-7 animate-spin text-zinc-500" />
        <p className="text-xs text-zinc-500">Connecting to room…</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
      className="flex-1"
    >
      <VideoConference />
    </LiveKitRoom>
  );
};

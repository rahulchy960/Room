import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const room = req.nextUrl.searchParams.get("room");
    const username = req.nextUrl.searchParams.get("username");

    if (!room) {
      return NextResponse.json({ error: "Missing 'room' query param" }, { status: 400 });
    }
    if (!username) {
      return NextResponse.json({ error: "Missing 'username' query param" }, { status: 400 });
    }

    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    if (!apiKey || !apiSecret || !wsUrl) {
      console.log("[LIVEKIT] Missing env vars", {
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret,
        hasWsUrl: !!wsUrl,
      });
      return NextResponse.json(
        { error: "LiveKit env vars not configured" },
        { status: 500 },
      );
    }

    const channel = await prisma.channel.findUnique({
      where: { id: room },
      include: {
        server: {
          select: {
            members: {
              where: { profileId: profile.id },
              select: { id: true },
            },
          },
        },
      },
    });

    let authorized = false;
    if (channel) {
      authorized = channel.server.members.length > 0;
    } else {
      const conversation = await prisma.conversation.findUnique({
        where: { id: room },
        select: {
          memberOne: { select: { profileId: true } },
          memberTwo: { select: { profileId: true } },
        },
      });

      if (!conversation) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }

      authorized =
        conversation.memberOne.profileId === profile.id ||
        conversation.memberTwo.profileId === profile.id;
    }

    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: `${profile.id}:${username}`,
      name: username,
    });
    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();
    return NextResponse.json({ token });
  } catch (error) {
    console.log("[LIVEKIT_GET]", error);
    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

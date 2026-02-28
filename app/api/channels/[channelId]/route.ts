import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { MemberRole } from "@/lib/generated/prisma/enums";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId || !channelId) {
      return new NextResponse("Missing IDs", { status: 400 });
    }

    const deleted = await prisma.channel.deleteMany({
      where: {
        id: channelId,
        serverId: serverId,
        name: { not: "General" },
        server: {
          members: {
            some: {
              profileId: profile.id,
              role: {
                in: [MemberRole.ADMIN, MemberRole.MODERATOR]
              }
            }
          }
        }
      }
    });

    if (deleted.count === 0) {
      return new NextResponse("Forbidden or not found", { status: 403 });
    }

    return new NextResponse("Channel deleted", { status: 200 });

  } catch (error) {
    console.log("[CHANNEL_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const { name, type } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId || !channelId) {
      return new NextResponse("Missing IDs", { status: 400 });
    }

    if (name === "General") {
      return new NextResponse("Name cannot be 'General'", { status: 400 });
    }

    const updated = await prisma.channel.updateMany({
      where: {
        id: channelId,
        serverId: serverId,
        name: { not: "General" },
        server: {
          members: {
            some: {
              profileId: profile.id,
              role: {
                in: [MemberRole.ADMIN, MemberRole.MODERATOR],
              },
            },
          },
        },
      },
      data: {
        name,
        type,
      },
    });

    if (updated.count === 0) {
      return new NextResponse("Forbidden or not found", { status: 403 });
    }

    return new NextResponse("Channel updated", { status: 200 });

  } catch (error) {
    console.log("[CHANNEL_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
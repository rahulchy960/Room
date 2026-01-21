import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;

    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, imageUrl } = await req.json();

    if (!name || !imageUrl) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const server = await prisma.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json(server);

  } catch (error) {
    console.log("[SERVER_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

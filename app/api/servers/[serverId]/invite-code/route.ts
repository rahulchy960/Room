import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ serverId: string }> }
) {
  const { params } = context;
  const { serverId } = await params;

  if (!serverId) {
    return new NextResponse("Server ID Missing", { status: 400 });
  }

  const profile = await currentProfile();

  if (!profile) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const server = await prisma.server.update({
    where: {
      id: serverId,
      profileId: profile.id,
    },
    data: {
      inviteCode: uuidv4(),
    },
  });

  return NextResponse.json(server);
}

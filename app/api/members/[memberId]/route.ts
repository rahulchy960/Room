import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { MemberRole } from "@/lib/generated/prisma/enums";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const { memberId } = await params;

    if(!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if(!serverId) {
      return new NextResponse("Server Id Missing", {status: 400});
    }

    if(!memberId) {
      return new NextResponse("Member Id Missing", { status: 400 });
    }

    const server = await prisma.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          deleteMany: {
            id: memberId,
            profileId: {
              not: profile.id,
            }
          }
        }
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          }
        }
      }
    });
    return NextResponse.json(server);


  } catch (error) {
    console.log("[MEMBER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
){
    try{
      const profile = await currentProfile();
      const { searchParams } = new URL(req.url);
      const serverId = searchParams.get("serverId");
      const { memberId } = await params;
      const { role } = await req.json();

      if(!profile) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      if(!serverId) {
        return new NextResponse("Server Id Missing", {status: 400});
      }

      if(!memberId) {
        return new NextResponse("Member Id Missing", { status: 400 });
      }

      if(!Object.values(MemberRole).includes(role)) {
        return new NextResponse("Invalid role", { status: 400 });
      }

      const server = await prisma.server.update({
        where: {
          id: serverId,
          profileId: profile.id,
        },
        data: {
          members: {
            updateMany: {
              where: {
                id: memberId,
                serverId,
                profileId: {
                  not: profile.id
                }
              },
              data: {
                role
              }
            }
          }
        },
        include: {
          members: {
            include: {
              profile: true,
            },
            orderBy: {
              role: "asc"
            }
          }
        }
      });

      return NextResponse.json(server);

    } catch (error) {
    console.log("[MEMBERS_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
   }
}

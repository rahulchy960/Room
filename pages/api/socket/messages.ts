import { currentProfilePages } from "@/lib/current-profile-pages";
import { prisma } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { error } from "console";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if(req.method !== "POST") {
    return res.status(405).json({ error: "Method not Allowed" });
  }

  try {
    const profile = await currentProfilePages(req);
    const { content, fileUrl } = req.body;
    const { serverId, channelId } = req.query;

    if(!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if(!serverId) {
      return res.status(400).json({ error: "Server Id Missing" });
    }

    if(!channelId) {
      return res.status(400).json({ error: "Channel Id Missing" });
    }

    if(!content && !fileUrl) {
      return res.status(400).json({ error: "Content or file is required" });
    }

    const server = await prisma.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          }
        }
      },
      include: {
        members: true,
      }
    });

    if(!server){
      return res.status(404).json({ message: "Server not Found" })
    }

    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: server.id as string,
      }
    });

    if(!channel){
      return res.status(404).json({ message: "Channel not Found" })
    }

    const member = server.members.find((member) => member.profileId === profile.id);

    if(!member){
      return res.status(404).json({ message: "Member not Found" })
    }

    const message = await prisma.message.create({
      data: {
        content,
        fileUrl,
        channelId: channelId as string,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          }
        }
      }
    });

    const channelkey = `chat:${channelId}:messages`;

    res?.socket?.server?.io?.emit(channelkey, message);

    return res.status(200).json(message);

  } catch (error) {
    console.log("[MESSAGE_POST]" , error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
import { currentProfile } from "@/lib/current-profile"
import { prisma } from "@/lib/db";
import { ChannelType } from "@/lib/generated/prisma/enums";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";

interface ServerSideBarProps{
  serverId: string
}

export const ServerSidebar = async ({
  serverId
}: ServerSideBarProps) => {

  const profile = await currentProfile();

  if(!profile){
    redirect("/");
  }

  const server = await prisma.server.findFirst({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc"
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        }
      }
    },
  });

  if(!server){
    return redirect("/");
  }

  const textChennels = server?.channels.filter((channel) => 
    channel.type === ChannelType.TEXT);
  const audioChennels = server?.channels.filter((channel) => 
    channel.type === ChannelType.AUDIO);
  const videoChennels = server?.channels.filter((channel) => 
    channel.type === ChannelType.VIDEO);
  const members = server?.members.filter((member) => 
    member.profileId !==profile.id);

  const role = server.members.find((member) => member.profileId 
  === profile.id)?.role;


  return (
    <div className="flex flex-col h-full w-full text-accent-foreground bg-secondary  ">
      <ServerHeader 
        server={server}
        role={role}
      />
    </div>
  )
}
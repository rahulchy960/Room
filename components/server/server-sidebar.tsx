import { currentProfile } from "@/lib/current-profile"
import { prisma } from "@/lib/db";
import { ChannelType, MemberRole } from "@/lib/generated/prisma/enums";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";
import { ScrollArea } from "../ui/scroll-area";
import { ServerSearch } from "./server-search";
import { AtSign, Mic, ShieldAlert, ShieldCheck, User, Video } from "lucide-react";
interface ServerSideBarProps{
  serverId: string
}

const iconMap = {
  [ChannelType.TEXT]: <AtSign className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />
}

const roleIconMap = {
  [MemberRole.GUEST]: <User className="h-4 w-4 mr-2" />,
  [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 mr-2 text-primary" />,
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-destructive" />
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

  const textChannels = server?.channels.filter((channel) => 
    channel.type === ChannelType.TEXT);
  const audioChannels = server?.channels.filter((channel) => 
    channel.type === ChannelType.AUDIO);
  const videoChannels = server?.channels.filter((channel) => 
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
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch 
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],   
                }))
              }, 
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],   
                }))
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],   
                }))
              },
              {
                label: "Members",
                type: "member",
                data: members?.map((member) => ({
                  id: member.id,
                  name: member.profile.name,
                  icon: roleIconMap[member.role],   
                }))
              }
            ]}
          />
        </div>
      </ScrollArea>
    </div>
  )
}
"use client"

import { Channel, Server, ChannelType, MemberRole } from "@/lib/generated/prisma/browser";
import { cn } from "@/lib/utils";
import { AtSign, Edit, Lock, Mic, Trash, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ActionTooltip } from "../action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

interface ServerChannelProps{
  channel: Channel;
  server: Server;
  role?: MemberRole;
}

const iconMap = {
  [ChannelType.TEXT]: AtSign,
  [ChannelType.AUDIO]: Mic,
  [ChannelType.VIDEO]: Video,
}

export const ServerChannel = ({
  channel,
  server,
  role,
}: ServerChannelProps) => {
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();

  const Icon = iconMap[channel.type];

  return (
    <button
      onClick={() => {}}
      className={cn(
        "group w-full px-2 py-2 rounded-md flex items-center gap-x-2 text-left transition mb-1 hover:bg-popover hover:text-sidebar-accent-foreground",
        params?.channelId === channel.id && "bg-popover"
      )}
    >
      <Icon className="shrink-0 w-4 h-4 transition group-hover:text-sidebar-accent-foreground" />
      <p className={cn(
        "line-clamp-1 font-semibold text-sm transition group-hover:text-sidebar-accent-foreground",
        params?.channelId === channel.id && "text-primary"
      )}>
        {channel.name}
      </p>
      {channel.name !== "General" && role !== MemberRole.GUEST && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Edit" >
            <Edit 
              onClick={() =>onOpen("editChannel", { server, channel })}
              className="hidden group-hover:block w-4 h-4 hover:text-primary-foreground transition duration-100" />
          </ActionTooltip>
          <ActionTooltip label="Delete" >
            <Trash 
              onClick={() => onOpen("deleteChannel", { server, channel })}
              className="hidden group-hover:block w-4 h-4 hover:text-destructive transition duration-100" />
          </ActionTooltip>
        </div>
      )}
      {channel.name === "General" && (
        <Lock 
          className="ml-auto hidden group-hover:block w-4 h-4 hover:text-primary transition duration-100"
        />
      )}
    </button>
  );
}
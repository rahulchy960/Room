"use client"

import { ChannelType, MemberRole } from "@/lib/generated/prisma/enums";
import { ServerWithMembersAndProfiles } from "@/types";
import { ActionTooltip } from "../action-tooltip";
import { Plus, Settings } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

interface ServerSectionProps {
  label: string;
  role?: MemberRole;
  sectionType: "channels" | "members";
  channelType?: ChannelType;
  server?: ServerWithMembersAndProfiles;
}

export const ServerSection = ({
  label,
  role,
  sectionType,
  channelType,
  server,
}: ServerSectionProps) => {

  const { onOpen } = useModal();

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs uppercase font-semibold">
        {label}
      </p>
      {role !== MemberRole.GUEST && sectionType === "channels" && (
        <ActionTooltip label="Create Chennel" side="top">
          <button
          onClick={() => onOpen("createChannel", { channelType })}
          className="
            p-1
            rounded-md
            text-muted-foreground
            transition-colors duration-200
            hover:bg-sidebar-accent
            hover:text-sidebar-accent-foreground
          "
          >
            <Plus className="h-4 w-4 transition-colors duration-200" />
          </button>
        </ActionTooltip>
      )}
      {role === MemberRole.ADMIN && sectionType === "members" && (
        <ActionTooltip label="Create Chennel" side="top">
          <button
          onClick={() => onOpen("members", { server })}
          className="
            p-1
            rounded-md
            text-muted-foreground
            transition-colors duration-200
            hover:bg-sidebar-accent
            hover:text-sidebar-accent-foreground
          "
          >
            <Settings className="h-4 w-4 transition-colors duration-200" />
          </button>
        </ActionTooltip>
      )}
    </div>
  )
}
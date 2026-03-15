"use client"

import { Member, MemberRole, Profile, Server } from "@/lib/generated/prisma/browser";
import { cn } from "@/lib/utils";
import { ShieldAlert, ShieldCheck, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "../user-avatar";

interface ServerMemberProps {
  member: Member & { profile: Profile };
  server: Server;
}

const RoleIconMap = {
  [MemberRole.GUEST]: <User className="w-4 h-4 ml-2" />,
  [MemberRole.MODERATOR]: <ShieldCheck className="w-4 h-4 ml-2 text-primary" />,
  [MemberRole.ADMIN]: <ShieldAlert className="w-4 h-4 ml-2 text-destructive" />
}

export const ServerMember = ({
  member,
  server,
}: ServerMemberProps) => {

  const params = useParams();
  const router = useRouter();

  const icon = RoleIconMap[member.role];

  const onClick = () => {
    router.push(`/servers/${params?.serverId}/conversation/${member.id}`)
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full text-left transition mb-1 hover:bg-popover hover:text-sidebar-accent-foreground",
        params?.memberId === member.id && "bg-popover/20"
      )}
    >
      <UserAvatar 
        src={member.profile.imageUrl}
        className="h-8 w-8"
      />
      <p
        className={cn(
          "font-semibold text-xs transition group-hover:text-sidebar-accent-foreground",
        )}
      >
        {member.profile.name}
      </p>
      {icon}
    </button>
  );
}
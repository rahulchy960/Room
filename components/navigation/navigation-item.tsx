"use client"

import Image from "next/image";

import { cn } from "@/lib/utils";
import { ActionTooltip } from "../action-tooltip";
import { useParams, useRouter } from "next/navigation";

interface NavigationItemProps {
  id: string;
  imageUrl: string;
  name: string;
};

export const NavigationItem = ({
  id,
  imageUrl,
  name
}: NavigationItemProps) => {

  const params = useParams();
  const router = useRouter();

  const onClick = () => {
    router.push(`/servers/${id}`);
  }

  return (
    <ActionTooltip
      side="right"
      align="center"
      label={name}
    >
      <button
        onClick={onClick}
        className="group relative flex items-center"
      >
        <div className={cn(
          "absolute left-0 bg-sidebar-primary rounded-r-full transition-all w-1",
          params?.serverId !== id && "group-hover:h-5",
          params?.serverId === id ? "h-9" : "h-2"
        )} />
        <div
          className={cn(
            "relative mx-3 h-12 w-12 overflow-hidden rounded-3xl transition-all",
            "bg-sidebar-accent text-sidebar-accent-foreground",
            params?.serverId === id && "rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground",
            params?.serverId !== id && "group-hover:rounded-2xl group-hover:bg-sidebar-accent/80"
          )}
        >
          <Image
            fill
            src={imageUrl}
            alt={name}
            className="object-cover"
          />
        </div>
      </button>
    </ActionTooltip>
  )
}

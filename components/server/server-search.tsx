"use client"

import { Search } from "lucide-react";
import { useState } from "react";
import { CommandDialog, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { CommandEmpty } from "cmdk";
import { useParams, useRouter } from "next/navigation";

interface ServerSearchProps {
  data: {
    label: string;
    type: "channel" | "member",
    data: {
      icon: React.ReactNode;
      name: string;
      id: string;
    }[] | undefined
  }[]
}

export const ServerSearch = ({ data }: ServerSearchProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  const onClick = ({ id, type }: { id:string, type: "channel" | "member" }) => {
    setOpen(false);

    if(type === "member") {
      return router.push(`/servers/${params?.serverId}/conversations/${id}`);
    }

    if(type === "channel") {
      return router.push(`/servers/${params?.serverId}/channels/${id}`);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full bg-sidebar transition-colors duration-200 hover:bg-sidebar/70 cursor-pointer"
      >
        <Search className="h-4 w-4 transition-colors duration-200 group-hover:text-sidebar-accent-foreground" />
        <p className="font-semibold text-sm transition-colors duration-200 group-hover:text-sidebar-accent-foreground">
          Search
        </p>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search all channels and members" />
        <CommandList>
          <CommandEmpty>
            No Results found
          </CommandEmpty>
          {data.map(({ label, type,data }) => {
            if(!data?.length) return null;

            return (
              <CommandGroup key={label} heading={label}>
                {data?.map(({ id, icon, name }) => {
                  return(
                    <CommandItem key={id} onSelect={() => onClick({ id, type })}>
                      {icon}
                      <span>{name}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )
          } )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
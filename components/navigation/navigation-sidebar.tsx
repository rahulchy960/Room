import { currentProfile } from "@/lib/current-profile"
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { NavigationAction } from "./navigation-action";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { NavigationItem } from "./navigation-item";
import { ModeToggle } from "../mode-toggle";
import { UserButton } from "@clerk/nextjs";


export const NavigationSidebar = async () => {
  const profile = await currentProfile();

  if(!profile) {
    return redirect("/");
  }

  const servers = await prisma.server.findMany({
    where: {
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  })
  
  return (
    <div className="space-y-4 flex flex-col items-center
      h-full w-full bg-sidebar text-sidebar-foreground py-3"
    >
      <NavigationAction />
      <div className="w-full px-2.5">
        <Separator className="h-1 bg-gray-600 rounded-md w-full" />
      </div>

      <ScrollArea className="flex-1 w-full">
        {servers.map((server) => (
          <div key={server.id} className="mb-4"> 
            <NavigationItem 
              id={server.id}
              name={server.name}
              imageUrl={server.imageUrl}
            />
          </div>
        ))}
      </ScrollArea>
      
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
        <div className="
          h-10 w-10
          rounded-3xl
          bg-linear-to-br from-indigo-500 via-purple-700 to-violet-500
          p-0.5
          transition-all duration-200
          hover:rounded-xl
        ">
          <div className="h-full w-full rounded-3xl bg-sidebar flex items-center justify-center">
            <UserButton />
          </div>
        </div>
      </div>
    </div>

  )
}

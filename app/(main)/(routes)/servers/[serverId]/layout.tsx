import { currentProfile } from "@/lib/current-profile"
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

const ServerIdLayout = async ({ children, params }: {
  children: React.ReactNode;
  params: {serverId: string};
}) => {

  const profile = await currentProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  const server = await prisma.server.findFirst({
    where: {
      id: params.serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if(!server) {
    return redirect("/");
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20
        flex-col fixed inset-y-0">
          Server Sidebar
      </div>
      <main className="h-full md:pl-60">
        {children}
      </main>
    </div>
  )
}

export default ServerIdLayout;
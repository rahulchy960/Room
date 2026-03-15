import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

interface ServerIdPageProps {
  params: Promise<{
    serverId: string;
  }>;
}


const ServerIdPage = async ({
  params
}: ServerIdPageProps) => {

  const { serverId } = await params;
  const profile = await currentProfile();

  if (!profile) {
      redirect("/sign-in");
  }

  const server = await prisma.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        }
      }
    },
    include: {
      channels: {
        where: {
          name: 'General'
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  const initialChannel = server?.channels[0];
  if(initialChannel?.name !== "General") {
    return null;
  }

  return (
    redirect(`/servers/${serverId}/channels/${initialChannel?.id}`)
  )
}

export default ServerIdPage;
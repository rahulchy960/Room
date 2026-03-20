import { ChatHeader } from "@/components/chat/chat-header";
import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { RedirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface ChannelIdPageProps {
  params: Promise<{
    serverId: string;
    channelId: string;
  }>;
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const { serverId, channelId } = await params;

  const profile = await currentProfile();

  if (!profile) {
    return <RedirectToSignIn />;
  }

  const member = await prisma.member.findFirst({
    where: {
      serverId,
      profileId: profile.id,
    },
  });

  const channel = await prisma.channel.findFirst({
    where: {
      id: channelId,
      serverId,
    },
  });

  if (!member || !channel) {
    redirect("/");
  }

  return (
    <div className="bg-sidebar flex flex-col h-full">
      <ChatHeader 
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
    </div>
  );
};

export default ChannelIdPage;
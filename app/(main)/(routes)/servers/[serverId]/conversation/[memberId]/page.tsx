import { ChatHeader } from "@/components/chat/chat-header";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

interface memberIdPageProps {
  params: Promise<{
    memberId: string;
    serverId: string;
  }>
}

const MemberIdPage = async ({
  params
} : memberIdPageProps) => {
  const { memberId, serverId } = await params;

  const profile = await currentProfile();

  if(!profile) {
    redirect("/sign-in");
  }

  const currentMember = await prisma.member.findFirst({
    where: {
      serverId: serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if(!currentMember){
     redirect("/");
  }

  const conversation = await getOrCreateConversation(currentMember.id, memberId);

  if(!conversation) {
    redirect(`/servers/${serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne;

  return (
    <div className="bg-sidebar">
      <ChatHeader
        imageUrl={otherMember.profile.imageUrl}
        name={otherMember.profile.name}
        serverId={serverId}
        type="conversation"
      />
    </div>
  )
}

export default MemberIdPage;
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

interface memberIdPageProps {
  params: Promise<{
    memberId: string;
    serverId: string;
  }>;
  searchParams: Promise<{
    video?: string;
  }>;
}

const MemberIdPage = async ({ params, searchParams }: memberIdPageProps) => {
  const { memberId, serverId } = await params;
  const { video } = await searchParams;

  const profile = await currentProfile();

  if (!profile) {
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

  if (!currentMember) {
    redirect("/");
  }

  const conversation = await getOrCreateConversation(currentMember.id, memberId);

  if (!conversation) {
    redirect(`/servers/${serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember =
    memberOne.profileId === profile.id ? memberTwo : memberOne;

  return (
    <div className="bg-sidebar flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember.profile.imageUrl}
        name={otherMember.profile.name}
        serverId={serverId}
        type="conversation"
      />

      {video === "true" && (
        <MediaRoom chatId={conversation.id} video={true} audio={true} />
      )}

      {video !== "true" && (
        <>
          <ChatMessages
            member={currentMember}
            name={otherMember.profile.name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            socketUrl="/api/socket/direct-messages"
            socketQuery={{ conversationId: conversation.id }}
            paramKey="conversationId"
            paramValue={conversation.id}
          />
          <ChatInput
            name={otherMember.profile.name}
            type="conversation"
            apiUrl="/api/socket/direct-messages"
            query={{ conversationId: conversation.id }}
          />
        </>
      )}
    </div>
  );
};

export default MemberIdPage;

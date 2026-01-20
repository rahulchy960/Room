import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

interface InviteCodePageProps {
  params: Promise<{
    inviteCode: string;
  }>;
}

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
  // ✅ params is async in Server Components
  const { inviteCode } = await params;

  // ✅ currentProfile is async
  const profile = await currentProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  if (!inviteCode) {
    redirect("/");
  }

  // ✅ Check if user already joined
  const existingServer = await prisma.server.findFirst({
    where: {
      inviteCode,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (existingServer) {
    redirect(`/servers/${existingServer.id}`);
  }

  // ✅ Join server
  const server = await prisma.server.update({
    where: {
      inviteCode,
    },
    data: {
      members: {
        create: {
          profileId: profile.id,
        },
      },
    },
  });

  // ✅ FIXED typo: servers (plural)
  redirect(`/servers/${server.id}`);
};

export default InviteCodePage;

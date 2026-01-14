import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db"; // prisma = db according to new version

export const initialProfile = async () => {
  const user = await currentUser();
  if(!user){
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  const profile = await prisma.profile.findUnique({
    where: {
      userId: user.id
    }
  });

  if(profile){
    return profile;
  }

  const newProfile = await prisma.profile.create({
    data: {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress
    }
  });

  return newProfile;
}
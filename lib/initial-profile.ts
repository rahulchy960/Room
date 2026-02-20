// import { auth, currentUser } from "@clerk/nextjs/server";
// import { prisma } from "@/lib/db"; // prisma = db according to new version

// export const initialProfile = async () => {
//   const user = await currentUser();
//   if(!user){
//     const { redirectToSignIn } = await auth();
//     return redirectToSignIn();
//   }

//   const profile = await prisma.profile.findUnique({
//     where: {
//       userId: user.id
//     }
//   });

//   if(profile){
//     return profile;
//   }

//   const newProfile = await prisma.profile.create({
//     data: {
//       userId: user.id,
//       name: `${user.firstName} ${user.lastName}`,
//       imageUrl: user.imageUrl,
//       email: user.emailAddresses[0].emailAddress
//     }
//   });

//   return newProfile;
// }


import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const initialProfile = async () => {
  // 1️⃣ Get session WITHOUT hitting Clerk API
  const { userId } = await auth();

  // 2️⃣ Redirect if not signed in (App Router way)
  if (!userId) {
    redirect("/sign-in");
  }

  // 3️⃣ Check DB first (avoid unnecessary Clerk call)
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (profile) return profile;

  // 4️⃣ Only NOW call Clerk (runs once per new user)
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // 5️⃣ Create profile
  const newProfile = await prisma.profile.create({
    data: {
      userId: user.id,
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress
    }
  });

  return newProfile;
};

import { Server, Member, Profile } from "./lib/generated/prisma/client"


export type ServerWithMembersAndProfiles = Server & {
  members: (Member & {
    profile: Profile;
  })[];
};
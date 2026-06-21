// LOG: [POLIMDO GO] Ekstensi Tipe NextAuth untuk Role dan Profil Pengguna
import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      profileId?: string | null;
      nim?: string | null;
      nip?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    profileId?: string | null;
    nim?: string | null;
    nip?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    profileId?: string | null;
    nim?: string | null;
    nip?: string | null;
  }
}

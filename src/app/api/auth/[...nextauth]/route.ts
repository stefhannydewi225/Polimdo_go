// LOG: [POLIMDO GO] Route API Handler NextAuth untuk Endpoint Auth.js
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

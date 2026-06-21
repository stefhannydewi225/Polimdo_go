// LOG: [POLIMDO GO] Provider NextAuth Client-Side
'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// LOG: [POLIMDO GO] Middleware Guard untuk Role dan Rute Terproteksi (Student, Lecturer, Admin)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Pastikan user memiliki token (sudah login)
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role;

    // Pembatasan Rute Mahasiswa
    if (path.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Pembatasan Rute Dosen
    if (path.startsWith("/lecturer") && role !== "LECTURER") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Pembatasan Rute Admin
    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/student/:path*",
    "/lecturer/:path*",
    "/admin/:path*",
  ],
};

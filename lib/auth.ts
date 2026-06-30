"use server";

import { compare, hash } from "bcryptjs";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authCookieName, authSecret } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function hashPassword(password: string) {
  return hash(password, 12);
}

function signSession(userId: string) {
  return createHmac("sha256", authSecret()).update(userId).digest("base64url");
}

function sessionValue(userId: string) {
  return `${userId}.${signSession(userId)}`;
}

function verifySession(value: string | undefined) {
  if (!value) return null;
  const [userId, signature] = value.split(".");
  if (!userId || !signature) return null;
  const expected = signSession(userId);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  return timingSafeEqual(actualBuffer, expectedBuffer) ? userId : null;
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await compare(password, user.passwordHash))) {
    redirect("/login?error=invalid");
  }

  const jar = await cookies();
  jar.set(authCookieName, sessionValue(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(authCookieName);
  redirect("/login");
}

export async function currentUser() {
  const jar = await cookies();
  const userId = verifySession(jar.get(authCookieName)?.value);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true } });
}

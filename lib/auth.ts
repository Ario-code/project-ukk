import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export type SessionUser = { id: string; name: string; email: string; role: string };

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get("token")?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return {
      id: String(payload.id),
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: String(payload.role ?? ""),
    };
  } catch {
    return null;
  }
}
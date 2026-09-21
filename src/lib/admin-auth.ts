import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";

export type AdminPayload = {
  username: string;
  iat: number;
  exp: number;
};

export function signToken(username: string): string {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export function getAdminFromRequest(req: NextRequest): AdminPayload | null {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAdmin(req: NextRequest): { admin: AdminPayload } | NextResponse {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { admin };
}

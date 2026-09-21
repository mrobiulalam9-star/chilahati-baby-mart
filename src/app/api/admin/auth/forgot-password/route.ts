import { NextRequest, NextResponse } from "next/server";
import { getAdminPassword } from "@/lib/admin-password";
import { getAdminEmail, isMailConfigured, sendPasswordRecovery } from "@/lib/admin-mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (!isMailConfigured() || !getAdminEmail()) {
      return NextResponse.json(
        { error: "Password recovery is not configured yet." },
        { status: 501 }
      );
    }

    if (email.toLowerCase() === getAdminEmail().toLowerCase()) {
      await sendPasswordRecovery(getAdminEmail(), getAdminPassword());
    }

    return NextResponse.json({
      success: true,
      message: "If this email matches your admin account, a message has been sent.",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
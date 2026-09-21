import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  generateReport,
  getReportStorage,
} from "@/lib/report";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const extension = (file.name.split(".").pop() || "").toLowerCase();
    if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) {
      return NextResponse.json(
        { error: `Unsupported file type ".${extension}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 20MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await generateReport(buffer, file.name);

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Report generation failed:", err);
    const message = err instanceof Error ? err.message : "Failed to generate report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { filePath } = getReportStorage();
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "No report has been generated yet" }, { status: 404 });
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (err) {
    console.error("Report download failed:", err);
    return NextResponse.json({ error: "Failed to read report" }, { status: 500 });
  }
}
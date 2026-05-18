import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const RATE_LIMIT_DIR = path.join(process.cwd(), ".rate-limit");
const DAILY_LIMIT = 3;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

function getDailyUsage(ip: string): number {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const filePath = path.join(RATE_LIMIT_DIR, today);
    if (!fs.existsSync(filePath)) return 0;
    const data: Record<string, number> = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );
    return data[ip] || 0;
  } catch {
    return 0;
  }
}

export function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const used = getDailyUsage(ip);
  const remaining = Math.max(0, DAILY_LIMIT - used);

  return NextResponse.json({
    remaining,
    limit: DAILY_LIMIT,
  });
}

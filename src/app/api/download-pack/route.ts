import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "wallpapers");
    const files = fs
      .readdirSync(filePath)
      .filter((f) => f.endsWith(".jpg"))
      .sort();

    // Use the pre-built tar.gz if it exists
    const tarballPath = path.join(process.cwd(), "public", "ai-wallpaper-pack.tar.gz");
    if (fs.existsSync(tarballPath) && fs.statSync(tarballPath).size > 5_000_000) {
      const buffer = fs.readFileSync(tarballPath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/gzip",
          "Content-Disposition": `attachment; filename="ai-wallpaper-pack.tar.gz"`,
          "Content-Length": buffer.length.toString(),
        },
      });
    }

    // Build a zip file on the fly (simple approach: use a tar.gz)
    return NextResponse.json(
      { error: "Wallpaper pack file not found. Please contact support." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Download pack error:", error);
    return NextResponse.json(
      { error: "Download failed. Please try again." },
      { status: 500 }
    );
  }
}

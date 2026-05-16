import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, imageData } = body;

    if (!sessionId || !imageData) {
      return NextResponse.json(
        { error: "sessionId and imageData are required" },
        { status: 400 }
      );
    }

    // Verify the Stripe session was paid
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 402 }
      );
    }

    // Extract base64 data (remove data:image/png;base64, prefix)
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="wallpaper-${sessionId.slice(-8)}.png"`,
        "Content-Length": imageBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}

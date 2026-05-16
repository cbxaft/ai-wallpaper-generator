"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Verify the session
      const verify = async () => {
        try {
          await fetch("/api/webhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
        } catch {
          // Webhook will handle it asynchronously
        }
        setLoading(false);
      };
      verify();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        {loading ? (
          <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-6" />
        ) : (
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
        )}
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Thank you for your purchase. You can now generate and download HD
          wallpapers without watermarks.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
        >
          Start Creating
        </Link>
      </div>
    </div>
  );
}

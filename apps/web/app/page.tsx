"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        router.replace("/videos");
      } else {
        router.replace("/login");
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="sketch-box p-8 text-center bg-paper-card">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mx-auto mb-3" />
        <p className="font-handwritten text-xl font-bold text-neutral-800">
          Loading your sketchbook...
        </p>
      </div>
    </div>
  );
}

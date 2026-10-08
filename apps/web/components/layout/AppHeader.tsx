"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { LogOut, Sparkles, Video, User } from "lucide-react";
import { Button } from "@/components/ui";

export function AppHeader() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      console.error("Failed to sign out", err);
    }
  };

  return (
    <header className="w-full border-b-2 border-ink bg-paper-card py-3 px-4 sm:px-8 flex items-center justify-between shadow-sketch-sm sticky top-0 z-30">
      <Link
        href="/videos"
        className="flex items-center gap-2 group decoration-none"
      >
        <div className="w-9 h-9 rounded-lg border-2 border-ink bg-marker-yellow flex items-center justify-center shadow-sketch-sm group-hover:-rotate-3 transition-transform">
          <Video className="w-5 h-5 text-neutral-900" />
        </div>
        <div className="flex flex-col">
          <span className="font-handwritten text-xl font-bold tracking-wide text-neutral-900 leading-none flex items-center gap-1">
            Video Sensei
            <Sparkles className="w-4 h-4 text-amber-500 inline-block animate-pulse" />
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
            Notebook RAG
          </span>
        </div>
      </Link>

      {session?.user ? (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 text-xs font-semibold sketch-box-sm bg-amber-50 text-neutral-800">
            <User className="w-3.5 h-3.5 text-neutral-700" />
            <span className="truncate max-w-[160px]">
              {session.user.name || session.user.email}
            </span>
          </div>
          <Button
            onClick={handleSignOut}
            variant="secondary"
            size="sm"
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            title="Sign out"
            className="hover:text-red-600"
          >
            <span className="hidden xs:inline">Sign Out</span>
          </Button>
        </div>
      ) : (
        <Link
          href="/login"
          className="sketch-button-primary px-4 py-1.5 text-xs"
        >
          Sign In
        </Link>
      )}
    </header>
  );
}

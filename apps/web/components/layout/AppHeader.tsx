"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { LogOut, Sparkles, Video, User } from "lucide-react";
import { Button } from "@/components/ui";
import Image from "next/image";

export function AppHeader() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      console.error("Failed to sign out", err);
      alert("Failed to sign out");
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
            Video RAG
          </span>
        </div>
      </Link>

      {session?.user ? (
        <div className="flex items-center gap-3">
          <details className="group relative">
            <summary
              aria-label="Open profile details"
              className="flex cursor-pointer list-none items-center gap-2 px-2 py-1 text-xs font-semibold text-neutral-800 sketch-box-sm bg-amber-50 [&::-webkit-details-marker]:hidden"
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                  <User className="h-4 w-4 text-neutral-700" />
                </span>
              )}
              <span className="hidden max-w-40 truncate sm:inline">
                {session.user.name || session.user.email}
              </span>
            </summary>
            <div className="absolute right-0 top-full z-40 mt-2 w-64 sketch-box-sm bg-paper-card p-4 text-neutral-900 shadow-sketch-sm">
              <p className="truncate text-sm font-bold">
                {session.user.name || "User"}
              </p>
              <p className="mt-1 break-all text-xs text-neutral-600">
                {session.user.email}
              </p>
              <Button
                onClick={handleSignOut}
                variant="secondary"
                size="sm"
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
                title="Sign out"
                className="mt-4 w-full hover:text-red-600"
              >
                Sign Out
              </Button>
            </div>
          </details>
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

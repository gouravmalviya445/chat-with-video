import { env } from "@/config/env";
import { createAuthClient } from "better-auth/react";

const API_PREFIX = env.NEXT_PUBLIC_API_URL.endsWith("/api")
  ? env.NEXT_PUBLIC_API_URL : `${env.NEXT_PUBLIC_API_URL}/api`;

export const authClient = createAuthClient({
  baseURL: `${API_PREFIX}/auth`,
});

export const { useSession, signIn, signUp, signOut } = authClient;

import { betterAuth, google } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";

import db from "@db";
import * as schema from "@db/schema";
import { env } from "@/config/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema
  }),

  emailAndPassword: {
    enabled: true
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  trustedOrigins: [
    "http://localhost:3000",
    ...(env?.CORS_ORIGIN ? [env.CORS_ORIGIN] : [])
  ],

  socialProviders: {
    google: {
      clientId: env?.GOOGLE_CLIENT_ID!,
      clientSecret: env?.GOOGLE_CLIENT_SECRET!
    }
  }
})
const _env = {
  NEXT_PUBLIC_API_URL: String(process.env.NEXT_PUBLIC_API_URL),
  NEXT_PUBLIC_SUPABASE_URL: String(process.env.NEXT_PUBLIC_SUPABASE_URL),
} as const;

export const env = Object.freeze(_env);




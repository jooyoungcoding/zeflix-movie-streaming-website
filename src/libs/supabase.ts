import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  typeof document === "undefined"
    ? {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    : undefined
);
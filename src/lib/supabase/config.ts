/**
 * Supabase connection settings, read from environment variables.
 *
 * Newer Supabase projects issue a "publishable" key; older ones call the same
 * thing the "anon" key. Both are safe to expose in the browser — row-level
 * security in the database is what actually protects the data. We accept
 * either name so the project works whichever one your dashboard shows.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  ''

/** True when both settings are present, so pages can show a helpful message. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY)

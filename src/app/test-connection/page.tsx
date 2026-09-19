import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

// Always check live rather than serving a cached result.
export const dynamic = 'force-dynamic'

export default async function TestConnectionPage() {
  if (!isSupabaseConfigured) {
    return (
      <Shell status="warn" heading="Not configured yet">
        <p>
          Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{' '}
          to <code className="font-mono">.env.local</code>, then restart the dev
          server.
        </p>
      </Shell>
    )
  }

  const supabase = await createClient()
  const { data: topics, error } = await supabase
    .from('topics')
    .select('slug, title, paper')
    .order('sort_order')

  if (error) {
    return (
      <Shell status="error" heading="Connected, but the query failed">
        <p className="mb-3">
          Supabase answered, so your keys are right — the problem is in the
          database.
        </p>
        <pre className="overflow-x-auto rounded bg-black/10 p-3 text-xs dark:bg-black/40">
          {error.message}
        </pre>
        <p className="mt-3 text-sm opacity-80">
          If this says the table does not exist, run{' '}
          <code className="font-mono">supabase/schema.sql</code> in the Supabase
          SQL editor.
        </p>
      </Shell>
    )
  }

  return (
    <Shell
      status="ok"
      heading={`Connected — ${topics?.length ?? 0} topics found`}
    >
      <ul className="divide-y divide-black/10 dark:divide-white/10">
        {topics?.map((topic) => (
          <li key={topic.slug} className="flex items-baseline gap-3 py-2">
            <span className="w-8 shrink-0 text-xs opacity-60">
              {topic.paper}
            </span>
            <span className="font-medium">{topic.title}</span>
          </li>
        ))}
      </ul>
    </Shell>
  )
}

function Shell({
  status,
  heading,
  children,
}: {
  status: 'ok' | 'warn' | 'error'
  heading: string
  children: React.ReactNode
}) {
  const tone = {
    ok: 'border-emerald-500/40 bg-emerald-500/5',
    warn: 'border-amber-500/40 bg-amber-500/5',
    error: 'border-rose-500/40 bg-rose-500/5',
  }[status]

  const dot = {
    ok: 'bg-emerald-400',
    warn: 'bg-amber-400',
    error: 'bg-rose-400',
  }[status]

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="mb-2 text-sm uppercase tracking-wide opacity-60">
        Supabase connection test
      </p>
      <div className={`rounded-xl border p-6 ${tone}`}>
        <h1 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          {heading}
        </h1>
        {children}
      </div>
    </main>
  )
}

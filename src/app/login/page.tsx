'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { signIn, signUp } from './actions'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const next = useSearchParams().get('next') ?? '/'
  const [signInState, signInAction, signingIn] = useActionState(signIn, {})
  const [signUpState, signUpAction, signingUp] = useActionState(signUp, {})

  const state = signInState.error ? signInState : signUpState

  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="mb-1 text-2xl font-semibold">HPL Pure Mathematics</h1>
      <p className="mb-8 text-sm opacity-70">
        Sign in to track your progress.
      </p>

      <form className="space-y-4">
        <input type="hidden" name="next" value={next} />

        <Field
          label="Full name"
          name="full_name"
          type="text"
          hint="Only needed when creating an account"
        />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />

        {state.error && (
          <p className="rounded border border-rose-500/40 bg-rose-500/10 p-3 text-sm">
            {state.error}
          </p>
        )}
        {signUpState.message && (
          <p className="rounded border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
            {signUpState.message}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            formAction={signInAction}
            disabled={signingIn || signingUp}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {signingIn ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            formAction={signUpAction}
            disabled={signingIn || signingUp}
            className="flex-1 rounded-lg border border-black/20 px-4 py-2 font-medium transition hover:bg-black/5 disabled:opacity-50 dark:border-white/25 dark:hover:bg-white/10"
          >
            {signingUp ? 'Creating…' : 'Create account'}
          </button>
        </div>
      </form>
    </main>
  )
}

function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-white/5 dark:focus:border-blue-400"
      />
      {hint && <span className="mt-1 block text-xs opacity-60">{hint}</span>}
    </label>
  )
}

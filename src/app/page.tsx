export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">
        Cambridge A Level &middot; 9709
      </p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        HPL Pure Mathematics
      </h1>
      <p className="text-lg text-black/70 dark:text-white/70">
        Lessons, worked examples and concept-driven questioning for Pure
        Mathematics 1, built around the High Performance Learning framework.
      </p>
      <div className="rounded-lg border border-black/10 p-4 text-sm text-black/60 dark:border-white/15 dark:text-white/60">
        Starter page. Edit{" "}
        <code className="rounded bg-black/5 px-1 py-0.5 font-mono dark:bg-white/10">
          src/app/page.tsx
        </code>{" "}
        to begin.
      </div>
    </main>
  );
}

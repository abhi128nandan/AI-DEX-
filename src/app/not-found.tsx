import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl font-black text-white/10 mb-4 select-none">404</div>
      <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
      <p className="text-slate-400 mb-8 max-w-sm">
        This page doesn&apos;t exist or was removed. Head back to discover AI tools.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
      >
        Back to AI-DEX
      </Link>
    </div>
  );
}

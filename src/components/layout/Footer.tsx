import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0f] py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="bg-purple-600 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">AIDex</span>
          </Link>
          <p className="text-sm text-slate-400 max-w-sm">
            The discovery engine for the AI ecosystem. Find the best tools, compare features, and stay updated with the latest in artificial intelligence.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-white mb-4">Explore</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/categories" className="hover:text-purple-400 transition-colors">Categories</Link></li>
            <li><Link href="/trending" className="hover:text-purple-400 transition-colors">Trending</Link></li>
            <li><Link href="/new" className="hover:text-purple-400 transition-colors">New Additions</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4">Connect</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="#" className="hover:text-purple-400 transition-colors">Twitter</Link></li>
            <li><Link href="#" className="hover:text-purple-400 transition-colors">Discord</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/10 text-sm text-slate-500 text-center flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} AIDex. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
          <Link href="#" className="hover:text-slate-300">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

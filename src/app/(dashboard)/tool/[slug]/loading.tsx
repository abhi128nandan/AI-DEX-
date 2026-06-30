export default function ToolDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-pulse mt-8">
      {/* Hero Skeleton Map */}
      <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/5 bg-[#0a0a0f] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10 w-full">
          
          <div className="w-32 h-32 rounded-2xl bg-white/5 shrink-0" />

          <div className="flex-1 space-y-5 w-full">
            <div className="space-y-3">
               <div className="w-1/2 h-8 bg-white/10 rounded-lg" />
               <div className="flex gap-3">
                  <div className="w-20 h-6 bg-white/5 rounded-full" />
                  <div className="w-20 h-6 bg-white/5 rounded-full" />
               </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-4 w-full">
              <div className="w-48 h-12 bg-white/10 rounded-xl" />
              <div className="w-40 h-12 bg-white/5 rounded-xl hidden sm:block" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-4">
             <div className="w-40 h-6 bg-white/10 rounded-md" />
             <div className="h-48 bg-white/5 rounded-2xl border border-white/5" />
          </div>
          <div className="space-y-4">
             <div className="w-32 h-6 bg-white/10 rounded-md" />
             <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-white/5 rounded-xl" />
                <div className="h-12 bg-white/5 rounded-xl" />
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-6 rounded-2xl border border-white/5 bg-[#12121c]/30 space-y-6">
             <div className="w-24 h-4 bg-white/10 rounded-sm" />
             <div className="space-y-4">
                <div className="h-24 bg-white/5 rounded-xl" />
                <div className="h-24 bg-white/5 rounded-xl" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GlobalLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12 py-12">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="w-1/3 h-8 bg-white/5 animate-pulse rounded-lg border border-white/5" />
        
        {/* Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[230px] rounded-2xl bg-white/5 animate-pulse border border-white/5 relative overflow-hidden">
               <div className="absolute inset-x-0 -top-px h-px w-1/2 mx-auto bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
               
               <div className="p-6">
                 <div className="flex gap-4">
                   <div className="w-14 h-14 rounded-[14px] bg-white/5 animate-pulse shrink-0" />
                   <div className="space-y-2 flex-1 pt-1">
                     <div className="w-3/4 h-5 bg-white/10 animate-pulse rounded-md" />
                     <div className="flex gap-2">
                       <div className="w-16 h-4 bg-white/5 animate-pulse rounded-full" />
                       <div className="w-16 h-4 bg-white/5 animate-pulse rounded-full" />
                     </div>
                   </div>
                 </div>

                 <div className="space-y-2 mt-6">
                    <div className="w-full h-4 bg-white/5 animate-pulse rounded-md" />
                    <div className="w-full h-4 bg-white/5 animate-pulse rounded-md" />
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

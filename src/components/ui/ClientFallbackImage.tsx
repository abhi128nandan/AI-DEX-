'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ClientFallbackImageProps {
  src: string;
  alt: string;
  fallbackInitials: string;
  className?: string;
}

/**
 * Client Component wrapper for Next.js Image with error fallback.
 * 
 * WHY this is a separate Client Component:
 * - Next.js Image onError handler requires client-side state
 * - Parent page.tsx is a Server Component (for SEO, data fetching)
 * - Extracting just the Image into a Client Component keeps the page server-rendered
 * 
 * This pattern allows:
 * - Server Component benefits (SEO, performance, data fetching)
 * - Client-side error handling for images
 * - Graceful fallback when logo URLs fail to load
 */
export default function ClientFallbackImage({ 
  src, 
  alt, 
  fallbackInitials,
  className = "object-contain rounded-xl p-2"
}: ClientFallbackImageProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-400 to-cyan-400">
        {fallbackInitials}
      </span>
    );
  }

  return (
    <Image 
      src={src} 
      alt={alt} 
      fill
      className={className}
      unoptimized
      onError={() => setImageError(true)}
    />
  );
}

import React from 'react';

interface CarouselProps {
  children: React.ReactNode;
}

export function Carousel({ children }: CarouselProps) {
  return (
    <div className="relative -mx-4 sm:mx-0">
      <div className="flex overflow-x-auto gap-6 pb-6 px-4 sm:px-0 snap-x snap-mandatory scrollbar-hide smooth-scroll">
        {React.Children.map(children, (child) => (
          <div className="snap-start shrink-0">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

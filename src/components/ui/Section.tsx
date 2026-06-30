import React from 'react';

interface SectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, description, action, children, className = '' }: SectionProps) {
  return (
    <section className={`py-12 md:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-slate-400 mt-2 max-w-2xl text-[15px] leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="shrink-0 pb-1">
              {action}
            </div>
          )}
        </div>
        <div className="w-full">
          {children}
        </div>
      </div>
    </section>
  );
}

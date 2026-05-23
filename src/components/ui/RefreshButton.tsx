'use client';

interface RefreshButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function RefreshButton({ className, children }: RefreshButtonProps) {
  return (
    <button 
      onClick={() => window.location.reload()}
      className={className}
    >
      {children || 'Refresh Page'}
    </button>
  );
}

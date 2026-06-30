'use client';

import { Tool } from '@/types';
import ToolCard from './ToolCard';
import { Carousel } from '@/components/ui/Carousel';
import { Section } from '@/components/ui/Section';
import Link from 'next/link';

interface DynamicSectionProps {
  title: string;
  description?: string;
  tools: Tool[];
  viewAllLink?: string;
  isAuthenticated?: boolean;
}

export function DynamicSection({ title, description, tools, viewAllLink, isAuthenticated = false }: DynamicSectionProps) {
  if (!tools || tools.length === 0) return null;

  return (
    <Section 
      title={title} 
      description={description}
      action={viewAllLink ? (
        <Link href={viewAllLink} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
          View all &rarr;
        </Link>
      ) : undefined}
    >
      <Carousel>
        {tools.map((tool, index) => (
          <div key={tool.id} className="w-[85vw] sm:w-[350px] max-w-[400px]">
            <ToolCard 
              tool={tool} 
              index={index} 
              isAuthenticated={isAuthenticated} 
            />
          </div>
        ))}
      </Carousel>
    </Section>
  );
}

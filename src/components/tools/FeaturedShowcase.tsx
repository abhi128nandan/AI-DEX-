'use client';

import { Tool } from '@/types';
import ToolCard from './ToolCard';
import { Carousel } from '@/components/ui/Carousel';
import { Section } from '@/components/ui/Section';
import Link from 'next/link';

interface FeaturedShowcaseProps {
  tools: Tool[];
  isAuthenticated?: boolean;
}

export default function FeaturedShowcase({ tools, isAuthenticated = false }: FeaturedShowcaseProps) {
  if (!tools || tools.length === 0) return null;

  return (
    <Section 
      title="Featured AI Tools" 
      description="Hand-picked tools curated for quality and innovation."
      action={
        <Link href="/?sort=votes#directory" className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">
          View all trending &rarr;
        </Link>
      }
    >
      <Carousel>
        {tools.map((tool, index) => (
          <div key={tool.id} className="w-[85vw] sm:w-[400px] max-w-[450px]">
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

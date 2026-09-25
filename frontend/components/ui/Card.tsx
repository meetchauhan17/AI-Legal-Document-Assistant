'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'hero';
  interactive?: boolean;
  className?: string;
}

/**
 * High-Fidelity Claymorphism Card component.
 * Features 4-layer clay shadow, rounded-32px corners, soft backdrop blur,
 * and optional interactive lift physics (hover:-translate-y-2 duration-500).
 */
export default function Card({
  children,
  variant = 'glass',
  interactive = false,
  className = '',
  ...props
}: CardProps) {
  // Variant background & padding rules
  const variantStyles = {
    glass: 'bg-white/60 backdrop-blur-xl p-8',
    solid: 'bg-white p-8',
    hero: 'bg-white/75 backdrop-blur-xl p-10 sm:p-12',
  };

  // Interactive physics
  const interactiveStyles = interactive
    ? 'cursor-pointer hover:-translate-y-2 hover:shadow-deepClay active:translate-y-0 active:shadow-clayCard transition-all duration-500 ease-out'
    : 'transition-all duration-300';

  return (
    <div
      className={`relative overflow-hidden rounded-[32px] text-clay-foreground shadow-clayCard border border-white/80 ${variantStyles[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {/* Inner content wrapper supporting decorative absolute-positioned elements */}
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}

export { Card };

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
  // Variant background & padding rules (optimized backdrop blur for smooth 60fps rendering)
  const variantStyles = {
    glass: 'bg-white/75 backdrop-blur-md p-6 sm:p-8',
    solid: 'bg-white p-6 sm:p-8',
    hero: 'bg-white/85 backdrop-blur-md sm:backdrop-blur-lg p-8 sm:p-12',
  };

  // Interactive physics (hardware accelerated transform + shadow)
  const interactiveStyles = interactive
    ? 'cursor-pointer hover:-translate-y-1.5 hover:shadow-deepClay active:translate-y-0 active:scale-[0.99] active:shadow-clayCard transition-[transform,box-shadow] duration-250 ease-out will-change-transform transform-gpu'
    : 'transition-[transform,box-shadow] duration-200 ease-out';

  // Check if card content should be horizontally centered
  const isCentered = className.includes('text-center') || className.includes('items-center');

  return (
    <div
      className={`relative overflow-hidden rounded-[32px] text-clay-foreground shadow-clayCard border border-white/80 ${variantStyles[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {/* Inner content wrapper supporting decorative absolute-positioned elements */}
      <div className={`relative z-10 flex h-full flex-col ${isCentered ? 'items-center' : ''}`}>{children}</div>
    </div>
  );
}

export { Card };

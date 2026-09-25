'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

/**
 * High-Fidelity Claymorphism Button component.
 * Features tactile multi-layer clay shadows, tactile "squish" physics on click (active:scale-[0.92]),
 * lifted hover physics (hover:-translate-y-1), accessible focus rings, and Nunito font.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  style = {},
  ...props
}: ButtonProps) {
  // Height & padding rules based on size prop
  const sizeStyles = {
    sm: 'h-11 px-5 text-sm rounded-[16px]',
    md: 'h-14 px-8 text-base rounded-[20px]',
    lg: 'h-16 px-10 text-lg rounded-[24px]',
  };

  // Variant visual styles and physics
  const variantStyles = {
    primary:
      'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clayButton hover:shadow-clayButtonHover hover:-translate-y-1 active:scale-[0.92] active:shadow-clayPressed',
    secondary:
      'bg-white text-clay-foreground shadow-clayButton hover:shadow-clayButtonHover hover:-translate-y-1 active:scale-[0.92] active:shadow-clayPressed border border-white/80',
    outline:
      'border-2 border-clay-accent/20 bg-transparent text-clay-accent hover:border-clay-accent hover:bg-clay-accent/5 active:scale-[0.95]',
    ghost:
      'text-clay-foreground hover:bg-clay-accent/10 hover:text-clay-accent active:scale-[0.95]',
  };

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none shadow-none transform-none'
    : 'cursor-pointer';

  return (
    <button
      className={`inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-clay-accent/30 focus-visible:ring-offset-2 ${sizeStyles[size]} ${variantStyles[variant]} ${disabledStyles} ${className}`}
      disabled={disabled}
      style={{
        fontFamily: 'var(--font-nunito), Nunito, sans-serif',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button };

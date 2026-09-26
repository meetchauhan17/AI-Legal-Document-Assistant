'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface PillBadgeProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  variant?: 'purple' | 'emerald' | 'amber' | 'blue';
  className?: string;
}

/**
 * Premium, crisp pill badge component for eyebrows and section tags.
 * Replaces the muddy/sunken clayPressed pill boxes with an elevated,
 * beautifully lit, modern badge that never stretches across its container.
 */
export default function PillBadge({
  icon: Icon,
  children,
  variant = 'purple',
  className = '',
}: PillBadgeProps) {
  const variantStyles = {
    purple: 'bg-white/95 text-clay-accent border-[#8B5CF6]/25 shadow-[0_2px_12px_-2px_rgba(109,40,217,0.12),0_1px_3px_rgba(0,0,0,0.04)]',
    emerald: 'bg-white/95 text-emerald-700 border-emerald-500/25 shadow-[0_2px_12px_-2px_rgba(16,185,129,0.12),0_1px_3px_rgba(0,0,0,0.04)]',
    amber: 'bg-white/95 text-amber-800 border-amber-500/25 shadow-[0_2px_12px_-2px_rgba(245,158,11,0.12),0_1px_3px_rgba(0,0,0,0.04)]',
    blue: 'bg-white/95 text-indigo-700 border-indigo-500/25 shadow-[0_2px_12px_-2px_rgba(99,102,241,0.12),0_1px_3px_rgba(0,0,0,0.04)]',
  };

  const iconBg = {
    purple: 'bg-[#8B5CF6]/12 text-clay-accent',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-heading font-bold w-fit mx-auto self-center select-none backdrop-blur-sm transition-all hover:scale-[1.02] ${variantStyles[variant]} ${className}`}
    >
      {Icon && (
        <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${iconBg[variant]}`}>
          <Icon className="w-2.5 h-2.5 stroke-[2.5]" />
        </span>
      )}
      <span className="tracking-tight">{children}</span>
    </div>
  );
}

export { PillBadge };

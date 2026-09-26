'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: string;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  error?: string;
}

/**
 * High-Fidelity Claymorphism Input component.
 * Features a concave/recessed default state (bg-[#EFEBF5] shadow-clayPressed)
 * that smoothly transforms to raised-white on focus (focus:bg-white focus:ring-4 focus:ring-clay-accent/20).
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`w-full h-16 rounded-2xl border-0 bg-[#EFEBF5] px-6 py-4 text-clay-foreground text-lg shadow-clayPressed placeholder:text-clay-muted transition-[background-color,box-shadow] duration-200 ease-out focus:outline-none focus:bg-white focus:ring-4 focus:ring-clay-accent/20 focus:shadow-clayCard disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'ring-2 ring-red-400 bg-red-50/50' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 ml-2 text-xs font-medium text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

/**
 * High-Fidelity Claymorphism Textarea component.
 * Mirrors the concave-to-raised transformation for multi-line contract text input.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, rows = 6, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full rounded-2xl border-0 bg-[#EFEBF5] px-6 py-4 text-clay-foreground text-base shadow-clayPressed placeholder:text-clay-muted transition-[background-color,box-shadow] duration-200 ease-out focus:outline-none focus:bg-white focus:ring-4 focus:ring-clay-accent/20 focus:shadow-clayCard disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
            error ? 'ring-2 ring-red-400 bg-red-50/50' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 ml-2 text-xs font-medium text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export default Input;

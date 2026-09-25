'use client';

import React from 'react';
import ClayBlobs from '../ClayBlobs';

/**
 * FloatingShapes now delegates directly to the High-Fidelity ClayBlobs ambient background.
 */
export default function FloatingShapes({ className = '' }: { className?: string }) {
  return <ClayBlobs />;
}

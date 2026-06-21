'use client';
import dynamic from 'next/dynamic';

const InteractiveToolsDynamic = dynamic(
  () => import('./InteractiveTools').then(m => ({ default: m.InteractiveTools })),
  { ssr: false, loading: () => <div className="h-64 py-20 bg-transparent" /> }
);

export const InteractiveToolsLazy = () => <InteractiveToolsDynamic />;
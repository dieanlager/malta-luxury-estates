import type { Metadata } from 'next';
import { GozoBridgeTrackerClient } from '@/src/components/GozoBridgeTrackerClient';

export const metadata: Metadata = {
  title: 'Gozo Bridge Property Impact Tracker',
  description: 'Track how the proposed Gozo bridge affects property values across Malta and Gozo from 2023 to 2031.',
};

export default function GozoBridgePage() {
  return (
    <main className="min-h-screen pt-20">
      <GozoBridgeTrackerClient />
    </main>
  );
}
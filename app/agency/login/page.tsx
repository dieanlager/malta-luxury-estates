import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Agency Login | Malta Luxury Real Estate',
  robots: { index: false, follow: false },
};
export { AgencyLoginPage as default } from '@/src/components/agency/AgencyLoginPage';

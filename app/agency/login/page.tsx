export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Agency Login',
  robots: { index: false, follow: false },
};
export { AgencyLoginPage as default } from '@/src/components/agency/AgencyLoginPage';

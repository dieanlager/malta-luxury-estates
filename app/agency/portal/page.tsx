export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Agency Portal', robots: { index: false } };
export { AgencyPortal as default } from '@/src/components/agency/AgencyPortal';

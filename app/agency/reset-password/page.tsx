export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Reset Password', robots: { index: false } };
export { AgencyResetPassword as default } from '@/src/components/agency/AgencyResetPassword';

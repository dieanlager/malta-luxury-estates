export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Forgot Password', robots: { index: false } };
export { AgencyForgotPassword as default } from '@/src/components/agency/AgencyForgotPassword';

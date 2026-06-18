import { redirect } from 'next/navigation';

export default function ToolsPage({ params }: { params: Promise<{ locale: string }> }) {
    // Redirect to mortgage calculator as default tool
    redirect('/tools/mortgage');
}
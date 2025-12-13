
import SystemComplementarityClient from '@/components/admin/SystemComplementarityClient';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Análise de Complementaridade | Laboratório',
    description: 'Descubra sistemas que se complementam para criar estratégias vencedoras.'
};

export default async function ComplementarityPage() {
    const session = await auth();
    // Optional: Check for admin restriction if needed, but laboratory implies experimentation
    // if (!session?.user?.email) redirect('/login'); 

    return <SystemComplementarityClient />;
}

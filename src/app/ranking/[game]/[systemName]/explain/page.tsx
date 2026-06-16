import SystemExplanation from '@/components/systems/SystemExplanation';

interface Props {
    params: Promise<{
        game: string;
        systemName: string;
    }>;
}

export default async function ExplainPage({ params }: Props) {
    const { game, systemName: encodedName } = await params;
    const systemName = decodeURIComponent(encodedName);

    return <SystemExplanation systemName={systemName} game={game} />;
}

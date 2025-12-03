import { getHistory } from '../actions';
import SimulatorPageClient from '@/components/SimulatorPageClient';

export default async function SimulatorPage() {
    const history = await getHistory();

    return (
        <SimulatorPageClient
            history={history.map((d) => ({
                date: d.date.toISOString(),
                numbers: d.numbers,
                stars: d.stars,
            }))}
        />
    );
}

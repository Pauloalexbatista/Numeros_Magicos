import { getHistory } from '../actions';
import SequencesClient from '@/components/SequencesClient';

export default async function SequencesPage({ searchParams }: { searchParams: Promise<{ limit?: string }> }) {
    const history = await getHistory();
    const { limit: limitParam } = await searchParams;

    // Determine number of draws to analyze (default 50)
    const limit = limitParam ? parseInt(limitParam) : 50;
    const drawsToAnalyze = limit > 0 ? history.slice(0, limit) : history;

    // Calculate Max Sequences and Max Absences within the sample
    const maxSequences: Record<number, number> = {};
    const maxAbsences: Record<number, number> = {};

    for (let i = 1; i <= 50; i++) {
        let currentSeq = 0;
        let currentAbs = 0;
        let maxSeq = 0;
        let maxAbs = 0;

        // Iterate through draws from oldest to newest to build streaks naturally
        // (drawsToAnalyze is usually Newest -> Oldest, so we reverse for calculation)
        const chronologicalDraws = [...drawsToAnalyze].reverse();

        for (const draw of chronologicalDraws) {
            const hasNum = draw.numbers.includes(i);

            if (hasNum) {
                currentSeq++;
                currentAbs = 0;
            } else {
                currentAbs++;
                currentSeq = 0;
            }

            if (currentSeq > maxSeq) maxSeq = currentSeq;
            if (currentAbs > maxAbs) maxAbs = currentAbs;
        }

        maxSequences[i] = maxSeq;
        maxAbsences[i] = maxAbs;
    }

    // Calculate Global Stats (Record Sequence & Record Absence) using FULL history
    const globalMaxSequences: Record<number, number> = {};
    const globalRecordAbsences: Record<number, number> = {};

    for (let i = 1; i <= 50; i++) {
        // Global Record Sequence
        let currentSeq = 0;
        let maxSeq = 0;

        // Global Record Absence
        let currentAbs = 0;
        let maxAbs = 0;

        // Iterate full history (reversed for chronological order)
        const fullHistoryChronological = [...history].reverse();

        for (const draw of fullHistoryChronological) {
            const hasNum = draw.numbers.includes(i);

            if (hasNum) {
                currentSeq++;
                currentAbs = 0;
            } else {
                currentAbs++;
                currentSeq = 0;
            }

            if (currentSeq > maxSeq) maxSeq = currentSeq;
            if (currentAbs > maxAbs) maxAbs = currentAbs;
        }
        globalMaxSequences[i] = maxSeq;
        globalRecordAbsences[i] = maxAbs;
    }

    return (
        <SequencesClient
            limit={limit}
            maxSequences={maxSequences}
            maxAbsences={maxAbsences}
            globalMaxSequences={globalMaxSequences}
            globalRecordAbsences={globalRecordAbsences}
        />
    );
}

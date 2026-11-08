import { generateWheelingSystem, generateFullSystem, GuaranteeOption, FullKey } from '@/services/wheeling';

// Listen for messages from the main thread
self.onmessage = (event: MessageEvent) => {
    const { numbers, stars, guarantee, starGuarantee, ticketSize } = event.data;

    try {
        if (stars && stars.length >= 2) {
            const keys = generateFullSystem(numbers, stars, guarantee, starGuarantee);
            self.postMessage({ type: 'SUCCESS', keys });
            return;
        }

        const size = ticketSize || 5;
        const rawKeys = generateWheelingSystem(numbers, guarantee, size);
        const keys: FullKey[] = rawKeys.map((k, i) => ({
            numbers: [...k].sort((a, b) => a - b),
            stars: [],
            strategy: `Cobertura ${guarantee?.label || ''} • Chave #${i + 1}`
        }));
        self.postMessage({ type: 'SUCCESS', keys });
    } catch (error) {
        self.postMessage({ type: 'ERROR', error: String(error) });
    }
};

import { generateFullSystem, GuaranteeOption } from '@/services/wheeling';

// Listen for messages from the main thread
self.onmessage = (event: MessageEvent) => {
    const { numbers, stars, guarantee, starGuarantee } = event.data;

    try {
        const keys = generateFullSystem(numbers, stars, guarantee, starGuarantee);
        // Send result back
        self.postMessage({ type: 'SUCCESS', keys });
    } catch (error) {
        self.postMessage({ type: 'ERROR', error: String(error) });
    }
};

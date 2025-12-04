import { kMeans } from '../services/clustering';

self.onmessage = (e: MessageEvent) => {
    const { history, k } = e.data;

    try {
        const result = kMeans(history, k);
        self.postMessage({ type: 'SUCCESS', result });
    } catch (error) {
        self.postMessage({ type: 'ERROR', error: (error as Error).message });
    }
};

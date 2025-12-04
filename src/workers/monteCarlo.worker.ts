import { runMonteCarloSimulation } from '../services/monteCarlo';

self.onmessage = (e: MessageEvent) => {
    const { history, iterations } = e.data;

    try {
        const result = runMonteCarloSimulation(history, iterations);
        self.postMessage({ type: 'SUCCESS', result });
    } catch (error) {
        self.postMessage({ type: 'ERROR', error: (error as Error).message });
    }
};

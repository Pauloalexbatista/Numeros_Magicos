/**
 * Process an array of items in batches to avoid blocking the event loop
 * @param items Array of items to process
 * @param batchSize Number of items to process in parallel
 * @param processor Function to process each item
 * @param onProgress Optional callback for progress updates
 * @param delayMs Optional delay between batches in milliseconds (default: 0)
 */
export async function processInBatches<T>(
    items: T[],
    batchSize: number,
    processor: (item: T) => Promise<void>,
    onProgress?: (processed: number, total: number) => void,
    delayMs: number = 0
) {
    const total = items.length;

    for (let i = 0; i < total; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        // Process batch in parallel
        await Promise.all(batch.map(item => processor(item)));

        const processed = Math.min(i + batchSize, total);
        if (onProgress) {
            onProgress(processed, total);
        }

        // Yield to event loop with optional delay
        await new Promise(resolve => setTimeout(resolve, delayMs));
    }
}

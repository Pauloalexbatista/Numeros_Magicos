import crypto from 'crypto';

/**
 * Computes a SHA-256 cryptographic seal for a prediction before the draw occurs.
 * Implements Audit Point #4 (Selo Criptográfico de Previsão).
 */
export function computePredictionHash(
    game: string,
    systemName: string,
    drawDate: string,
    prediction: number[],
    timestamp?: string
): string {
    const rawPayload = [
        game.toUpperCase(),
        systemName.trim(),
        drawDate.slice(0, 10),
        JSON.stringify(prediction),
        timestamp || 'LIVE_SEAL'
    ].join('::');

    return crypto.createHash('sha256').update(rawPayload).digest('hex');
}

/**
 * Verifies if a given prediction matches a purported SHA-256 seal.
 */
export function verifyPredictionHash(
    seal: string,
    game: string,
    systemName: string,
    drawDate: string,
    prediction: number[],
    timestamp?: string
): boolean {
    const computed = computePredictionHash(game, systemName, drawDate, prediction, timestamp);
    return computed.toLowerCase() === seal.toLowerCase();
}

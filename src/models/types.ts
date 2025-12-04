export interface Draw {
    id: number;
    date: string;
    numbers: number[];
    stars: number[];
    jackpot?: number | null;
    hasWinner?: boolean;
    numbersDrawOrder?: number[];
    starsDrawOrder?: number[];
}

export interface PredictionResult {
    numbers: number[];
    stars?: number[];
    confidence?: number;
    reasoning?: string; // Explanation of the prediction
}

export interface BacktestResult {
    totalDraws: number;
    hits: number;
    hitRate: number; // Percentage
    roi: number; // Return on Investment (Simulated)
    distribution: { [key: number]: number }; // Key: number of hits (0-5), Value: count
    expectedDistribution: { [key: number]: number }; // Key: hits, Value: expected percentage
    details: {
        drawDate: string;
        predicted: number[];
        actual: number[];
        matches: number;
        reasoning?: string;
    }[];
}

export interface PredictionModel {
    id: string;
    name: string;
    description: string;
    /**
     * Predicts the next draw based on historical data.
     * @param history Array of past draws (chronological order: oldest first, newest last)
     * @param predictionSize Number of numbers to predict (default 5)
     * @returns PredictionResult containing predicted numbers
     */
    predict(history: Draw[], predictionSize?: number): Promise<PredictionResult> | PredictionResult;
}

export interface RankedSystem {
    id: number;
    name: string;
    isActive: boolean;
    description?: string | null;
    createdAt: string | Date;
}

export interface SystemPerformance {
    id: number;
    drawId: number;
    systemName: string;
    predictedNumbers: number[];
    actualNumbers: number[];
    hits: number;
    accuracy: number;
    createdAt: string | Date;
}

export interface SystemRanking {
    id: number;
    systemName: string;
    avgAccuracy: number;
    totalPredictions: number;
    lastUpdated: string | Date;
}

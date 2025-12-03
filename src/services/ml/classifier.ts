import { NumberFeatures } from './featureEngineering';

interface TrainingRow extends NumberFeatures {
    target: number; // 0 or 1
}

interface ModelWeights {
    weights: number[];
    bias: number;
    featureStats: {
        min: number[];
        max: number[];
    };
}

export class LogisticRegressionClassifier {
    private weights: number[] = [];
    private bias: number = 0;
    private learningRate: number = 0.01;
    private epochs: number = 50; // Optimized: Reduced from 100 for performance
    private featureStats = {
        min: [] as number[],
        max: [] as number[]
    };

    constructor() { }

    /**
     * Train the model using Stochastic Gradient Descent
     */
    train(data: TrainingRow[]) {
        if (data.length === 0) return;

        // 1. Prepare data (Extract features vector)
        const X = data.map(row => this.extractFeatureVector(row));
        const y = data.map(row => row.target);

        const numFeatures = X[0].length;
        const numSamples = X.length;

        // 2. Normalize features (Min-Max Scaling)
        this.calculateFeatureStats(X);
        const normalizedX = X.map(row => this.normalize(row));

        // 3. Initialize weights
        this.weights = new Array(numFeatures).fill(0);
        this.bias = 0;

        // 4. SGD Training Loop
        for (let epoch = 0; epoch < this.epochs; epoch++) {
            for (let i = 0; i < numSamples; i++) {
                const prediction = this.predictProbabilityRaw(normalizedX[i]);
                const error = y[i] - prediction;

                // Update weights
                for (let j = 0; j < numFeatures; j++) {
                    this.weights[j] += this.learningRate * error * normalizedX[i][j];
                }
                // Update bias
                this.bias += this.learningRate * error;
            }
        }
    }

    /**
     * Predict probability for a single number
     */
    predict(features: NumberFeatures): number {
        const vector = this.extractFeatureVector(features);
        const normalizedVector = this.normalize(vector);
        return this.predictProbabilityRaw(normalizedVector);
    }

    private extractFeatureVector(row: NumberFeatures): number[] {
        return [
            row.lag,
            row.absoluteFreq,
            row.recentFreq,
            row.isEven,
            row.decade,
            row.coOccurrence,
            row.previousSum
        ];
    }

    private calculateFeatureStats(X: number[][]) {
        const numFeatures = X[0].length;
        this.featureStats.min = new Array(numFeatures).fill(Infinity);
        this.featureStats.max = new Array(numFeatures).fill(-Infinity);

        for (const row of X) {
            for (let j = 0; j < numFeatures; j++) {
                if (row[j] < this.featureStats.min[j]) this.featureStats.min[j] = row[j];
                if (row[j] > this.featureStats.max[j]) this.featureStats.max[j] = row[j];
            }
        }
    }

    private normalize(vector: number[]): number[] {
        return vector.map((val, j) => {
            const min = this.featureStats.min[j];
            const max = this.featureStats.max[j];
            if (max === min) return 0; // Avoid division by zero
            return (val - min) / (max - min);
        });
    }

    private predictProbabilityRaw(features: number[]): number {
        let z = this.bias;
        for (let i = 0; i < features.length; i++) {
            z += this.weights[i] * features[i];
        }
        return 1 / (1 + Math.exp(-z));
    }

    /**
     * Serialize model to JSON
     */
    toJSON(): ModelWeights {
        return {
            weights: this.weights,
            bias: this.bias,
            featureStats: this.featureStats
        };
    }

    /**
     * Load model from JSON
     */
    fromJSON(data: ModelWeights) {
        this.weights = data.weights;
        this.bias = data.bias;
        this.featureStats = data.featureStats;
    }
}

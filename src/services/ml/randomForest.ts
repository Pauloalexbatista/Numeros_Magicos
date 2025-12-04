import { DecisionTree, TreeNode } from './decisionTree';
import { NumberFeatures } from './featureEngineering';

interface TrainingRow extends NumberFeatures {
    target: number;
}

interface ForestData {
    trees: (TreeNode | null)[];
    featureStats: {
        min: number[];
        max: number[];
    };
}

export class RandomForestClassifier {
    private trees: DecisionTree[] = [];
    private numTrees: number;
    private maxDepth: number;
    private featureStats = {
        min: [] as number[],
        max: [] as number[]
    };

    constructor(numTrees: number = 10, maxDepth: number = 10) {
        this.numTrees = numTrees;
        this.maxDepth = maxDepth;
    }

    train(data: TrainingRow[]) {
        if (data.length === 0) return;

        // 1. Prepare Data
        const X = data.map(row => this.extractFeatureVector(row));
        const y = data.map(row => row.target);

        // 2. Normalize
        this.calculateFeatureStats(X);
        const normalizedX = X.map(row => this.normalize(row));

        // 3. Train Trees (Bagging)
        this.trees = [];
        for (let i = 0; i < this.numTrees; i++) {
            const { XSample, ySample } = this.bootstrapSample(normalizedX, y);
            const tree = new DecisionTree(this.maxDepth);
            tree.train(XSample, ySample);
            this.trees.push(tree);
        }
    }

    predict(features: NumberFeatures): number {
        const vector = this.extractFeatureVector(features);
        const normalizedVector = this.normalize(vector);

        let totalProb = 0;
        for (const tree of this.trees) {
            totalProb += tree.predict(normalizedVector);
        }

        return totalProb / this.trees.length;
    }

    private bootstrapSample(X: number[][], y: number[]) {
        const XSample: number[][] = [];
        const ySample: number[] = [];
        const nSamples = X.length;

        for (let i = 0; i < nSamples; i++) {
            const idx = Math.floor(Math.random() * nSamples);
            XSample.push(X[idx]);
            ySample.push(y[idx]);
        }

        return { XSample, ySample };
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
            if (max === min) return 0;
            return (val - min) / (max - min);
        });
    }

    toJSON(): ForestData {
        return {
            trees: this.trees.map(tree => tree.toJSON()),
            featureStats: this.featureStats
        };
    }

    fromJSON(data: ForestData) {
        this.featureStats = data.featureStats;
        this.trees = data.trees.map(root => {
            const tree = new DecisionTree(this.maxDepth);
            tree.fromJSON(root);
            return tree;
        });
    }
}

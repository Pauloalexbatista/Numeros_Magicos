import { NumberFeatures } from './featureEngineering';

export interface TreeNode {
    featureIndex?: number;
    threshold?: number;
    left?: TreeNode;
    right?: TreeNode;
    value?: number; // Probability for leaf node (0-1)
}

export class DecisionTree {
    private root: TreeNode | null = null;
    private maxDepth: number;
    private minSamplesSplit: number;

    constructor(maxDepth: number = 10, minSamplesSplit: number = 2) {
        this.maxDepth = maxDepth;
        this.minSamplesSplit = minSamplesSplit;
    }

    train(X: number[][], y: number[]) {
        this.root = this.buildTree(X, y, 0);
    }

    predict(features: number[]): number {
        if (!this.root) return 0;
        return this.traverseTree(features, this.root);
    }

    private buildTree(X: number[][], y: number[], depth: number): TreeNode {
        const numSamples = X.length;
        const numFeatures = X[0].length;
        const uniqueClasses = new Set(y).size;

        // Stopping criteria
        if (depth >= this.maxDepth || numSamples < this.minSamplesSplit || uniqueClasses === 1) {
            const leafValue = this.calculateLeafValue(y);
            return { value: leafValue };
        }

        // Find best split
        const bestSplit = this.getBestSplit(X, y, numFeatures);

        if (bestSplit.gain === 0) {
            const leafValue = this.calculateLeafValue(y);
            return { value: leafValue };
        }

        // Recursively build subtrees
        const leftSubtree = this.buildTree(bestSplit.XLeft, bestSplit.yLeft, depth + 1);
        const rightSubtree = this.buildTree(bestSplit.XRight, bestSplit.yRight, depth + 1);

        return {
            featureIndex: bestSplit.featureIndex,
            threshold: bestSplit.threshold,
            left: leftSubtree,
            right: rightSubtree
        };
    }

    private getBestSplit(X: number[][], y: number[], numFeatures: number) {
        let bestSplit = {
            featureIndex: -1,
            threshold: 0,
            gain: 0,
            XLeft: [] as number[][],
            yLeft: [] as number[],
            XRight: [] as number[][],
            yRight: [] as number[]
        };

        const parentEntropy = this.calculateEntropy(y);

        // Randomly select a subset of features (sqrt(n)) for Random Forest variance
        const featureIndices = this.getRandomSubspace(numFeatures);

        for (const featureIndex of featureIndices) {
            const featureValues = X.map(row => row[featureIndex]);
            const uniqueValues = [...new Set(featureValues)];

            for (const threshold of uniqueValues) {
                const { leftIndices, rightIndices } = this.split(X, featureIndex, threshold);

                if (leftIndices.length === 0 || rightIndices.length === 0) continue;

                const yLeft = leftIndices.map(i => y[i]);
                const yRight = rightIndices.map(i => y[i]);

                const gain = this.informationGain(y, yLeft, yRight, parentEntropy);

                if (gain > bestSplit.gain) {
                    bestSplit = {
                        featureIndex,
                        threshold,
                        gain,
                        XLeft: leftIndices.map(i => X[i]),
                        yLeft,
                        XRight: rightIndices.map(i => X[i]),
                        yRight
                    };
                }
            }
        }

        return bestSplit;
    }

    private split(X: number[][], featureIndex: number, threshold: number) {
        const leftIndices: number[] = [];
        const rightIndices: number[] = [];

        X.forEach((row, i) => {
            if (row[featureIndex] <= threshold) {
                leftIndices.push(i);
            } else {
                rightIndices.push(i);
            }
        });

        return { leftIndices, rightIndices };
    }

    private informationGain(y: number[], yLeft: number[], yRight: number[], parentEntropy: number): number {
        const weightLeft = yLeft.length / y.length;
        const weightRight = yRight.length / y.length;
        const childEntropy = weightLeft * this.calculateEntropy(yLeft) + weightRight * this.calculateEntropy(yRight);
        return parentEntropy - childEntropy;
    }

    private calculateEntropy(y: number[]): number {
        const uniqueLabels = [...new Set(y)];
        let entropy = 0;

        for (const label of uniqueLabels) {
            const count = y.filter(val => val === label).length;
            const p = count / y.length;
            entropy -= p * Math.log2(p);
        }

        return entropy;
    }

    private calculateLeafValue(y: number[]): number {
        const count1 = y.filter(val => val === 1).length;
        return count1 / y.length; // Probability of class 1
    }

    private traverseTree(features: number[], node: TreeNode): number {
        if (node.value !== undefined) return node.value;

        if (features[node.featureIndex!] <= node.threshold!) {
            return this.traverseTree(features, node.left!);
        } else {
            return this.traverseTree(features, node.right!);
        }
    }

    private getRandomSubspace(numFeatures: number): number[] {
        const indices = Array.from({ length: numFeatures }, (_, i) => i);
        const subsetSize = Math.floor(Math.sqrt(numFeatures)) || 1;

        // Fisher-Yates shuffle
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        return indices.slice(0, subsetSize);
    }

    toJSON(): TreeNode | null {
        return this.root;
    }

    fromJSON(root: TreeNode | null) {
        this.root = root;
    }
}

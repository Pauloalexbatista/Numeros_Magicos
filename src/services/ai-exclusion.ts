import * as synaptic from 'synaptic';
import * as fs from 'fs';
import * as path from 'path';
import { Draw } from '@prisma/client';

const MODEL_PATH = path.join(process.cwd(), 'src/ai/model_synaptic.json');
const GAME_MAX = 50;

let network: synaptic.Network | null = null;

export class AIExclusionService {

    private loadModel() {
        if (network) return network;

        try {
            const modelJson = fs.readFileSync(MODEL_PATH, 'utf8');
            const json = JSON.parse(modelJson);
            network = synaptic.Network.fromJSON(json);
            return network;
        } catch (error) {
            console.error("Failed to load AI model:", error);
            return null;
        }
    }

    public predictExclusions(history: Draw[], excludeCount: number = 5): number[] {
        const net = this.loadModel();
        if (!net || history.length === 0) return [];

        // Get the last draw to use as input
        // Assuming history is ordered DESC (newest first), so history[0] is the latest
        const lastDraw = history[0];

        // Parse numbers
        let nums: number[] = [];
        try {
            nums = JSON.parse(lastDraw.numbers);
        } catch (e) {
            // fallback if string
            if (typeof lastDraw.numbers === 'string') {
                nums = (lastDraw.numbers as string).split(',').map(Number);
            }
        }

        // Convert to vector
        const inputVector = new Array(GAME_MAX).fill(0);
        nums.forEach(n => {
            if (n >= 1 && n <= GAME_MAX) inputVector[n - 1] = 1;
        });

        // Predict
        const outputVector = net.activate(inputVector);

        // Select Candidates (Lowest Probability)
        const candidates = [];
        for (let n = 0; n < GAME_MAX; n++) {
            candidates.push({ n: n + 1, prob: outputVector[n] });
        }

        candidates.sort((a, b) => a.prob - b.prob);

        const toExclude = candidates.slice(0, excludeCount).map(c => c.n);

        return toExclude;
    }
}

export const aiExclusionService = new AIExclusionService();

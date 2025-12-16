
import { IPredictiveSystem } from '../../services/ranked-systems';
import { Draw } from '@prisma/client';
import { VortexPyramidSystem } from '../../services/vortex-pyramid';
import { SistMediaCamadas } from '../../services/custom/SistMediaCamadas';
import { SistCombinadoMedia3System } from '../../services/custom/SistCombinadoMedia3';

export class ConsensusSystem implements IPredictiveSystem {
    public name = 'Consensus Auto (Vortex + Camadas + Media3)';
    public description = 'Consenso automático entre Anti-Vortex, Média Camadas e Média+3 (Top 25 mais votados)';

    // Reuse instances
    private vortex = new VortexPyramidSystem();
    private camadas = new SistMediaCamadas();
    private media3 = new SistCombinadoMedia3System();

    async generateTop10(history: Draw[]): Promise<number[]> {
        const numberVotes = new Map<number, number>();

        // --- 1. Get Predictions ---

        // A. Anti-Vortex Pyramid (Inverted)
        let antiVortexNums: number[] = [];
        try {
            const vortexResult = await this.vortex.generateTop10(history);
            // Invert: Take numbers NOT in Vortex (1-50)
            const allNums = Array.from({ length: 50 }, (_, i) => i + 1);
            antiVortexNums = allNums.filter(n => !vortexResult.includes(n)).slice(0, 25);
        } catch (e) {
            console.error('Error in Consensus (Anti-Vortex):', e);
        }

        // B. Sistema Média Camadas
        let camadasNums: number[] = [];
        try {
            camadasNums = await this.camadas.generateTop10(history);
        } catch (e) {
            console.error('Error in Consensus (Camadas):', e);
        }

        // C. Sist Combinado Media+3
        let media3Nums: number[] = [];
        try {
            media3Nums = await this.media3.generateTop10(history);
        } catch (e) {
            console.error('Error in Consensus (Media3):', e);
        }

        // --- 2. Vote ---
        const vote = (nums: number[]) => {
            // Simple voting: +1 per system
            nums.forEach(n => numberVotes.set(n, (numberVotes.get(n) || 0) + 1));
        };

        vote(antiVortexNums);
        vote(camadasNums);
        vote(media3Nums);

        // --- 3. Sort & Select Top 25 ---
        const sortedNumbers = Array.from(numberVotes.entries())
            .sort((a, b) => {
                if (b[1] !== a[1]) return b[1] - a[1]; // More votes first
                return a[0] - b[0]; // Lower number tie-break
            })
            .slice(0, 25)
            .map(entry => entry[0])
            .sort((a, b) => a - b);

        // Fallback if empty
        if (sortedNumbers.length < 5) return [1, 2, 3, 4, 5]; // Safety

        return sortedNumbers;
    }
}

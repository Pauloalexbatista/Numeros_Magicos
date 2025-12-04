import { Draw } from '@prisma/client';
import { IPredictiveSystem } from '../ranked-systems';

export class mdiasemaspontasSystem implements IPredictiveSystem {
    name = "média sem as pontas";
    description = "Sistema costumizado criado via Admin UI";

    async generateTop10(draws: Draw[]): Promise<number[]> {
        // TODO: Implement logic here
        // Example: Return numbers 1 to 25
        return Array.from({ length: 25 }, (_, i) => i + 1);
    }
}

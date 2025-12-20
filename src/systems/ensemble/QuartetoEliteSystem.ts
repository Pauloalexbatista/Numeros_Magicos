import { Draw } from '@prisma/client';
import { ISystem, ISystemMetadata, IPredictionResult } from '../core/types';
import { ensure25 } from '../utils/helpers';
import { QuartetoComplementar } from '../../services/quarteto-complementar';

export class QuartetoEliteSystem implements ISystem {
    private service = new QuartetoComplementar();

    public metadata: ISystemMetadata = {
        name: 'Quarteto Elite (LSTM + Media3 + RF + SemPontas)',
        description: 'Ensemble de elite com 100% de cobertura (LSTM, Media+3, Random Forest, Média sem as Pontas)',
        type: 'ENSEMBLE',
        version: '1.0.0',
        isActiveByDefault: true
    };

    async predict(history: Draw[]): Promise<IPredictionResult> {
        const numbers = await this.service.generateTop25(history);
        return {
            numbers: ensure25(numbers, history),
            confidence: 1.0
        };
    }
}

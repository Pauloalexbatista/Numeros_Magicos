
import { Draw } from '@prisma/client';

export type SystemType =
    | 'NUMBERS_STATISTICAL'
    | 'NUMBERS_ML'
    | 'STARS_STATISTICAL'
    | 'STARS_ML'
    | 'ENSEMBLE'
    | 'EXCLUSION';

export interface ISystemMetadata {
    name: string;
    description: string;
    type: SystemType;
    version: string;
    tags?: string[];
    isActiveByDefault: boolean;
    requiresTraining?: boolean;
}

export interface IPredictionResult {
    numbers: number[];
    stars?: number[];
    confidence?: number;
}

export interface ISystem {
    metadata: ISystemMetadata;

    /**
     * Main prediction method.
     * @param history Full history of draws (usually for context)
     */
    predict(history: Draw[]): Promise<IPredictionResult>;

    /**
     * Optional training method for ML systems.
     * @param history Full history for training
     */
    train?(history: Draw[]): Promise<void>;
}

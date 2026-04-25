import { Draw } from '@prisma/client';

export interface NeuralTrainingOptions {
    backtestDrawId?: number;
    customHistory?: Draw[];
    epochs?: number;
    batchSize?: number;
    learningRate?: number;
}

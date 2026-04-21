import { prisma } from '@/lib/prisma';
import * as tf from '@tensorflow/tfjs';

/**
 * Neural Persistence Service
 * Handles the saving and loading of AI Models from the PostgreSQL DB.
 * Replaces the brittle filesystem-based trained_models folder.
 */
export class NeuralPersistenceService {
    
    /**
     * Saves a TensorFlow.js model to the Database
     */
    static async saveModel(model: tf.LayersModel, modelType: string, metadata: any = {}) {
        console.log(`[NeuralPersistence] Serializing weights for model: ${modelType}...`);
        
        let savedArtifacts: tf.io.ModelArtifacts | null = null;
        
        // Use tf.io.withSaveHandler to intercept the model artifacts without writing to disk
        await model.save(tf.io.withSaveHandler(async (artifacts) => {
            savedArtifacts = artifacts;
            return {
                modelArtifactsInfo: {
                    dateSaved: new Date(),
                    modelTopologyType: 'JSON'
                }
            };
        }));

        if (!savedArtifacts) {
            throw new Error(`Failed to capture artifacts for ${modelType}`);
        }

        // We convert the weights (which is an ArrayBuffer | ArrayBuffer[]) to Base64 for DB storage
        const weightData = (savedArtifacts as tf.io.ModelArtifacts).weightData;
        let base64Weights = '';
        
        if (weightData) {
            if (Array.isArray(weightData)) {
                const totalLength = weightData.reduce((acc, b) => acc + b.byteLength, 0);
                const combined = new Uint8Array(totalLength);
                let offset = 0;
                weightData.forEach(b => {
                    combined.set(new Uint8Array(b), offset);
                    offset += b.byteLength;
                });
                base64Weights = Buffer.from(combined).toString('base64');
            } else {
                base64Weights = Buffer.from(new Uint8Array(weightData)).toString('base64');
            }
        }

        // Prepare the payload
        const payload = {
            modelTopology: (savedArtifacts as tf.io.ModelArtifacts).modelTopology,
            weightSpecs: (savedArtifacts as tf.io.ModelArtifacts).weightSpecs,
            format: (savedArtifacts as tf.io.ModelArtifacts).format,
            generatedBy: (savedArtifacts as tf.io.ModelArtifacts).generatedBy,
            convertedBy: (savedArtifacts as tf.io.ModelArtifacts).convertedBy,
            userDefinedMetadata: (savedArtifacts as tf.io.ModelArtifacts).userDefinedMetadata,
            base64Weights
        };

        await prisma.aIModelStore.upsert({
            where: { modelType },
            update: {
                weights: JSON.stringify(payload),
                metadata: JSON.stringify(metadata),
                updatedAt: new Date()
            },
            create: {
                modelType,
                weights: JSON.stringify(payload),
                metadata: JSON.stringify(metadata)
            }
        });

        console.log(`[NeuralPersistence] SUCCESS: Model ${modelType} saved to DB.`);
    }

    /**
     * Loads a TensorFlow.js model from the Database
     */
    static async loadModel(modelType: string): Promise<tf.LayersModel | null> {
        const stored = await prisma.aIModelStore.findUnique({
            where: { modelType }
        });

        if (!stored) return null;

        try {
            const payload = JSON.parse(stored.weights);
            const weightBuffer = Buffer.from(payload.base64Weights, 'base64');
            
            const artifacts: tf.io.ModelArtifacts = {
                modelTopology: payload.modelTopology,
                weightSpecs: payload.weightSpecs,
                weightData: weightBuffer.buffer.slice(weightBuffer.byteOffset, weightBuffer.byteOffset + weightBuffer.byteLength),
                format: payload.format,
                generatedBy: payload.generatedBy,
                convertedBy: payload.convertedBy,
                userDefinedMetadata: payload.userDefinedMetadata
            };

            return await tf.loadLayersModel(tf.io.fromMemory(artifacts));
        } catch (error) {
            console.error(`[NeuralPersistence] Failed to load model ${modelType}:`, error);
            return null;
        }
    }

    /**
     * Updates the live progress for the Laboratory Dashboard
     */
    static async reportProgress(type: 'RF' | 'LSTM' | 'TITAN', game: string, domain: string, pct: number, currentDate?: Date) {
        try {
            const key = `${type}_PROGRESS`;
            const payload = {
                isRunning: pct < 100,
                game,
                domain,
                pct,
                currentDate: currentDate || new Date(),
                updatedAt: new Date()
            };

            await prisma.statisticsCache.upsert({
                where: { key },
                update: { data: JSON.stringify(payload) },
                create: { key, data: JSON.stringify(payload) }
            });
        } catch (error) {
            console.error(`[NeuralPersistence] Failed to report progress:`, error);
        }
    }

    /**
     * Checks if a neural training is already in progress globally
     */
    static async isSystemBusy(): Promise<boolean> {
        try {
            const lock = await prisma.statisticsCache.findUnique({
                where: { key: 'NEURAL_TRAINING_LOCK' }
            });
            if (!lock) return false;
            const data = JSON.parse(lock.data);
            
            // Auto-release lock after 1 hour to prevent deadlocks from crashed processes
            const ONE_HOUR = 60 * 60 * 1000;
            if (new Date().getTime() - new Date(data.startTime).getTime() > ONE_HOUR) {
                await this.releaseLock();
                return false;
            }
            
            return data.isLocked === true;
        } catch {
            return false;
        }
    }

    /**
     * Acquires the global training lock
     */
    static async acquireLock(type: string, game: string) {
        const payload = {
            isLocked: true,
            type,
            game,
            startTime: new Date()
        };
        await prisma.statisticsCache.upsert({
            where: { key: 'NEURAL_TRAINING_LOCK' },
            update: { data: JSON.stringify(payload) },
            create: { key: 'NEURAL_TRAINING_LOCK', data: JSON.stringify(payload) }
        });
    }

    /**
     * Releases the global training lock
     */
    static async releaseLock() {
        const payload = { isLocked: false, endTime: new Date() };
        await prisma.statisticsCache.upsert({
            where: { key: 'NEURAL_TRAINING_LOCK' },
            update: { data: JSON.stringify(payload) },
            create: { key: 'NEURAL_TRAINING_LOCK', data: JSON.stringify(payload) }
        });
    }
}

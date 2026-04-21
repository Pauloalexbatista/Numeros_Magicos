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

        // We convert the weights (which is an ArrayBuffer) to Base64 for DB storage
        const weightData = (savedArtifacts as tf.io.ModelArtifacts).weightData;
        const base64Weights = weightData 
            ? Buffer.from(weightData).toString('base64') 
            : '';

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
}

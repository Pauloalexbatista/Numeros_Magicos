import { prisma } from '../src/lib/prisma';

async function checkMLTraining() {
    const records = await prisma.mLModelTraining.findMany();
    console.log('ML Model Training records:');
    console.log(JSON.stringify(records, null, 2));
}

checkMLTraining()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });

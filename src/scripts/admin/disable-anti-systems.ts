
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Identifying Anti-Systems...');

    // Find systems starting with "Anti-"
    const antiSystems = await prisma.rankedSystem.findMany({
        where: {
            name: {
                startsWith: 'Anti-'
            },
            isActive: true
        }
    });

    console.log(`Found ${antiSystems.length} active Anti-Systems.`);

    if (antiSystems.length > 0) {
        console.log('🚫 Disabling Anti-Systems...');
        const result = await prisma.rankedSystem.updateMany({
            where: {
                name: {
                    startsWith: 'Anti-'
                }
            },
            data: {
                isActive: false
            }
        });
        console.log(`✅ Disabled ${result.count} systems.`);
    } else {
        console.log('✅ No active Anti-Systems found.');
    }

    // Also verify Neural Networks
    console.log('\n🔍 Verifying Neural Networks status...');
    const mlSystems = await prisma.rankedSystem.findMany({
        where: {
            name: {
                in: ['Random Forest', 'LSTM', 'ML Classifier']
            },
            isActive: true
        }
    });

    if (mlSystems.length > 0) {
        console.log(`⚠️ Found ${mlSystems.length} active ML systems: ${mlSystems.map(s => s.name).join(', ')}`);
        console.log('🚫 Disabling ML systems...');
        const resultML = await prisma.rankedSystem.updateMany({
            where: {
                name: {
                    in: ['Random Forest', 'LSTM', 'ML Classifier']
                }
            },
            data: {
                isActive: false
            }
        });
        console.log(`✅ Disabled ${resultML.count} ML systems.`);
    } else {
        console.log('✅ All Neural Networks are already disabled.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

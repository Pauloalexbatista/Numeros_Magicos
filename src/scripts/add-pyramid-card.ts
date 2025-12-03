import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addPyramidCard() {
    console.log('Adding Matrix Pyramid card to dashboard...');

    try {
        // Check if it already exists
        const existing = await prisma.dashboardCard.findFirst({
            where: { title: 'Matrix & Pirâmide' }
        });

        if (existing) {
            console.log('Card already exists. Updating...');
            await prisma.dashboardCard.update({
                where: { id: existing.id },
                data: {
                    componentKey: 'LinkCard',
                    title: 'Matrix & Pirâmide',
                    description: 'Validação visual e análise de intervalos',
                    icon: '🧬',
                    gridSpan: 1,
                    order: 3, // Place it early in the list
                    isActive: true,
                    minRole: 'USER',
                    price: 0,
                    config: JSON.stringify({
                        href: '/matrix/validation',
                        colorTheme: 'indigo',
                        badgeText: 'Visual',
                        badgeColor: 'bg-indigo-100 text-indigo-700'
                    })
                }
            });
        } else {
            console.log('Creating new card...');
            await prisma.dashboardCard.create({
                data: {
                    componentKey: 'LinkCard',
                    title: 'Matrix & Pirâmide',
                    description: 'Validação visual e análise de intervalos',
                    icon: '🧬',
                    gridSpan: 1,
                    order: 3,
                    isActive: true,
                    minRole: 'USER',
                    price: 0,
                    config: JSON.stringify({
                        href: '/matrix/validation',
                        colorTheme: 'indigo',
                        badgeText: 'Visual',
                        badgeColor: 'bg-indigo-100 text-indigo-700'
                    })
                }
            });
        }

        console.log('✅ Card added successfully!');

    } catch (error) {
        console.error('Error adding card:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addPyramidCard();

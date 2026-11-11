import { generateDailyReport } from '../src/services/dailyReportService';

async function run() {
  console.log('Regenerating EUROMILLIONS report...');
  const euro = await generateDailyReport('EUROMILLIONS');
  console.log('EUROMILLIONS done:', euro.id, 'Radar leader:', euro.summary.radarLeader, 'Systems count:', euro.systemsMatrix.length);
  const sep2Euro = euro.systemsMatrix.find(s => s.name.includes('Separação das Águas 2.0'));
  console.log('Separação das Águas 2.0 in Euromillions matrix:', !!sep2Euro);

  console.log('\nRegenerating TOTOLOTO report...');
  const toto = await generateDailyReport('TOTOLOTO');
  console.log('TOTOLOTO done:', toto.id, 'Radar leader:', toto.summary.radarLeader, 'Systems count:', toto.systemsMatrix.length);

  for (const g of ['EURODREAMS', 'MEGASENA', 'LOTOFACIL']) {
    try {
      console.log(`\nRegenerating ${g} report...`);
      const rep = await generateDailyReport(g);
      console.log(`${g} done:`, rep.id, 'Radar leader:', rep.summary.radarLeader);
    } catch (err: any) {
      console.warn(`Could not refresh ${g}:`, err.message);
    }
  }
}

run().catch(console.error);

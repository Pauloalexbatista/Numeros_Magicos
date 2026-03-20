import { trainRandomForestModel } from './src/services/neural/rf-train-core';
async function test() {
   const res = await trainRandomForestModel('EUROMILLIONS', true, 12, 'RF_EUROMILLIONS_STARS');
   console.log(res);
}
test();

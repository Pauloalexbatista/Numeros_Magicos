import { trainEuroDreamsNumbers } from './src/services/neural/eurodreams-numbers-neural';
import { trainEuromillionsNumbers } from './src/services/neural/euromillions-numbers-neural';
import { trainTotolotoNumbers } from './src/services/neural/totoloto-numbers-neural';

async function testMainNumbers() {
    console.log("Starting Euromillions Main Numbers test...");
    let result = await trainEuromillionsNumbers();
    console.log("Final Result EM:", result);

    console.log("\nStarting EuroDreams Main Numbers test...");
    result = await trainEuroDreamsNumbers();
    console.log("Final Result ED:", result);

    console.log("\nStarting Totoloto Main Numbers test...");
    result = await trainTotolotoNumbers();
    console.log("Final Result TOTOLOTO:", result);
}

testMainNumbers().catch(console.error);

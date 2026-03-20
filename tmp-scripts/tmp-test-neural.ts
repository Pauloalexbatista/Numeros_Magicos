import { trainEuromillionsStars } from './src/services/neural/euromillions-stars-neural';
import { trainTotolotoLucky } from './src/services/neural/totoloto-lucky-neural';

async function testTraining() {
    console.log("Starting Euromillions Stars Neural Network test...");
    let result = await trainEuromillionsStars();
    console.log("Final Result EM:", result);

    console.log("\nStarting Totoloto Lucky Number Neural Network test...");
    result = await trainTotolotoLucky();
    console.log("Final Result Totoloto:", result);
}

testTraining().catch(console.error);

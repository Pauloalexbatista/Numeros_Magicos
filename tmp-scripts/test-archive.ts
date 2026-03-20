import { EuroMillionsService } from './src/services/euroMillionsService';

async function test() {
    const s = new EuroMillionsService();
    // Test the gap filler directly to see what dates it pulls
    const res = await s.syncMissingDraws();
    console.log("Added draws total:", res);
}

test().catch(console.error);

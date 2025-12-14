
import 'dotenv/config';
console.log('Env Keys:', Object.keys(process.env).filter(k => k.includes('URL') || k.includes('DB')));

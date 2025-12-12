
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const key = process.env.RESEND_API_KEY;
const hasKey = !!key;
const match = key === 're_3evzLKjb_7NDZeVWLPY8BqhFo8Ak7kYLx';

console.log('Has RESEND_API_KEY:', hasKey);
if (hasKey) {
    console.log('Key matches hardcoded one:', match);
    console.log('Key starts with:', key.substring(0, 5) + '...');
} else {
    console.log('RESEND_API_KEY is missing from process.env');
}

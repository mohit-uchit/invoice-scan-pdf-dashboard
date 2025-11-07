import dotenv from 'dotenv';
import path from 'path';

// Load root .env first, then server/.env to allow server overrides
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });

// Optionally log for debug (disabled by default)
// console.log('Loaded env GEMINI:', !!process.env.GEMINI_API_KEY);

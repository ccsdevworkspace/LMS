import { StreamClient } from '@stream-io/node-sdk';
import { env } from './env.config.js';

const apiKey = env.streamApiKey;
const apiSecret = env.streamApiSecret;

if (!apiKey || !apiSecret) {
    console.warn(
        'STREAM_API_KEY or STREAM_API_SECRET is missing. Stream Video will not be fully functional.',
    );
}

export const streamClient = new StreamClient(apiKey || '', apiSecret || '');
export const STREAM_PUBLIC_API_KEY = apiKey || '';

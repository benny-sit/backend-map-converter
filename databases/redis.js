import { createClient } from 'redis';
import 'dotenv/config';

const url =
  process.env.IS_REDIS_REMOTE.trim() === 'true' ? process.env.REDIS_URL : '';

export const redisClient = createClient({
  url,
}).on('error', (err) => console.log('Redis Client Error', err));

export const redisConnect = async () => {
  await redisClient.connect();
  console.log('---- Redis Connect Successful ' + url + ' ----');
};

// TO CHECK
// await client.set('key1', 'value');
// const value = await client.get('key1');
// await client.disconnect();

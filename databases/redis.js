import { createClient } from 'redis';

export const redisClient = createClient()
  .on('error', err => console.log('Redis Client Error', err))

export const redisConnect = async () => await redisClient.connect();

// TO CHECK
// await client.set('key1', 'value');
// const value = await client.get('key1');
// await client.disconnect();
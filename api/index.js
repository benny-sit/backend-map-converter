import fastify from 'fastify';
import 'dotenv/config';
import cors from '@fastify/cors';
import { redisConnect } from '../databases/redis.js';

import conversion from './conversion/index.js';

const app = fastify({ logger: true });

app.addHook('onClose', function () {
  console.log('Successfully closed');
});

app.register(cors, { origin: '*' });

app.register(conversion, { prefix: '/conversion' });

const start = async () => {
  const port = process.env.PORT || 3000;
  console.log('NODE_ENV = ' + process.env.NODE_ENV);

  try {
    await redisConnect();
    await app.listen({ port });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();

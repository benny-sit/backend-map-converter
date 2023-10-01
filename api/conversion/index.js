import { STATUS_CODES } from 'http';
import { redisClient } from '../../databases/redis.js';
import getSetConversion from './getSetConversion.js';
import { ALL_CURRENCIES } from '../../utils/constants.js';

export default function (api, opts, done) {
  api.addHook('preHandler', async (req, res) => {
    console.log('PRE HANDLER');
  });

  api.route({
    method: 'GET',
    url: '/:baseCurrency',
    schema: {
      params: {
        type: 'object',
        required: ['baseCurrency'],
        properties: {
          baseCurrency: { type: 'string', enum: ALL_CURRENCIES },
        },
      },
    },
    handler: async (req, res) => {
      const baseCurrency = (req.params.baseCurrency || '').toUpperCase();

      let conversionRates = {};
      try {
        conversionRates = await getSetConversion(baseCurrency);
      } catch (e) {
        return res.code(400).send({ error: e });
      }

      return { conversion_rates: conversionRates };
    },
  });

  done();
}

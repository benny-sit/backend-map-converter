import getSetConversion from './getSetConversion.js';

export default function (api, opts, done) {
  api.addHook('preHandler', async (req, res) => {
    console.log('PRE HANDLER');
  });

  api.route({
    method: 'GET',
    url: '/:country',
    schema: {
      params: {
        type: 'object',
        required: ['country'],
        properties: {
          country: { type: 'string' },
        },
      },
    },
    handler: async (req, res) => {
      const country = (req.params.country || '').toLowerCase();

      console.log('COUNTRY ----', country);

      let articles = {};
      try {
        articles = await getSetConversion(country);
      } catch (e) {
        return res.code(400).send({ error: e });
      }

      return { articles: articles };
    },
  });

  done();
}

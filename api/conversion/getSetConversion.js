import { redisClient } from "../../databases/redis.js";
import { shuffleArray } from "../../utils/arrays.js";
import { ALL_CURRENCIES } from "../../utils/constants.js";

const AVAILABLE_API_KEYS = [
  process.env.EXCHANGE_RATE_API_KEY_1,
  process.env.EXCHANGE_RATE_API_KEY_2,
  process.env.EXCHANGE_RATE_API_KEY_3,
  process.env.EXCHANGE_RATE_API_KEY_4,
  process.env.EXCHANGE_RATE_API_KEY_5,
];

const TTL_SECONDS = 60 * 60;

async function tryMultipleApiKeys(baseCurrency) {
  let conversionRates;
  let currentArr = [...AVAILABLE_API_KEYS];
  shuffleArray(currentArr);

  for (const apiKey of currentArr) {
    if (!apiKey) continue;

    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${(
      baseCurrency || ""
    ).toUpperCase()}`;

    const ans = await fetch(url).then(res => res.json());

    if (ans.result === 'success') {
      conversionRates = ans.conversion_rates;
      break;
    }
  }

  if (!conversionRates) throw new Error(`Cannot get conversion rates`);

  return conversionRates;
}

export default async function (baseCurrency) {
  
  const redisKey = `conversion${baseCurrency}`;

  const existingRates = await redisClient.hGetAll(redisKey);
  
  if (existingRates && Object.keys(existingRates).length !== 0) {
    console.log("---- CACHE HIT ----")
    return existingRates;
  } 

  const conversionRates = await tryMultipleApiKeys(baseCurrency);

  await Promise.all([
    redisClient.hSet(redisKey, conversionRates),
    redisClient.expireAt(redisKey, parseInt((+new Date)/1000) + TTL_SECONDS)
  ])

  return conversionRates;
}

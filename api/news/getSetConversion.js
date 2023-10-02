import { redisClient } from '../../databases/redis.js';
import { shuffleArray } from '../../utils/arrays.js';

const AVAILABLE_API_KEYS = [
  process.env.NEWS_API_KEY_1,
  process.env.NEWS_API_KEY_2,
  process.env.NEWS_API_KEY_3,
];

const TTL_SECONDS = 60 * 60 * 24;

async function tryMultipleApiKeys(country) {
  let articles;
  let currentArr = [...AVAILABLE_API_KEYS];
  shuffleArray(currentArr);

  for (const apiKey of currentArr) {
    if (!apiKey) continue;

    const url = `https://newsapi.org/v2/top-headlines?country=${(
      country || ''
    ).toUpperCase()}&apiKey=${apiKey}`;

    const ans = await fetch(url).then((res) => res.json());

    if (ans.status === 'ok') {
      articles = ans.articles;
      break;
    }
  }

  if (!articles) throw new Error(`Cannot get articles`);

  return articles;
}

export default async function (country) {
  const redisKey = `news${country.toUpperCase()}`;

  const existingArticles = await redisClient.json.GET(redisKey, '$');

  if (existingArticles && Object.keys(existingArticles).length !== 0) {
    console.log('---- CACHE HIT ----');
    return existingArticles;
  }

  const newArticles = await tryMultipleApiKeys(country);

  await Promise.all([
    redisClient.json.SET(redisKey, '$', newArticles),
    redisClient.expireAt(redisKey, parseInt(+new Date() / 1000) + TTL_SECONDS),
  ]);

  return newArticles;
}

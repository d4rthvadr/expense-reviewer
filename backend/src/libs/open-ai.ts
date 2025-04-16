import dotenv from 'dotenv';
dotenv.config();

import OpenAi, { ClientOptions } from 'openai';

const configuration: ClientOptions = {
  apiKey: process.env.OPENAI_API_KEY,
};
const openai = new OpenAi(configuration);

export { openai };

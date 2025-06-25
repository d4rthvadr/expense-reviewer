export const mailtrapConfig = {
  apiKey: process.env.MAILTRAP_API_KEY || '',
  domain: process.env.MAILTRAP_DOMAIN || '',
  pass: process.env.MAILTRAP_PASSWORD || '',
  templateDir: './templates',
};

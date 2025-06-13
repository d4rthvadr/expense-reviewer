import OpenAi, { ClientOptions } from 'openai';

const isOpenAiApiKeyValid = (apiKey: string | undefined): boolean => {
  return !!apiKey && apiKey.startsWith('sk-');
};

const validateApiKey = (apiKey: string | undefined): apiKey is string => {
  if (!isOpenAiApiKeyValid(apiKey)) {
    throw new Error(
      'OpenAI API key is not provided or invalid. Ensure it starts with "sk-" and is correctly configured.'
    );
  }
  return true;
};

/**
 * Creates an OpenAi instance with the provided API key.
 * Assumes the API key has already been validated.
 * @param apiKey - The OpenAI API key.
 * @returns An instance of OpenAi.
 * @throws Will throw an error if the API key is not provided.
 */
const createOpenAi = (apiKey: string): OpenAi => {
  const configuration: ClientOptions = {
    apiKey,
  };
  return new OpenAi(configuration);
};
/**
 * Factory function to create an OpenAi instance.
 * This function validates the API key and delegates the creation to `createOpenAi`.
 * @param apiKey - The OpenAI API key.
 * @returns An instance of OpenAi.
 * @throws Will throw an error if the API key is not provided or invalid.
 */
export const createOpenAiFactory = (
  apiKey: string | undefined
): OpenAi | undefined => {
  if (validateApiKey(apiKey)) {
    return createOpenAi(apiKey);
  }
};

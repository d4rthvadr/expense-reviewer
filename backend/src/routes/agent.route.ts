import Express, { type Request, type Response } from 'express';
import OpenAi, { ClientOptions } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const route = Express.Router();

const configuration: ClientOptions = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openai = new OpenAi(configuration);

route.post('/process-text', async (req: Request, res: Response) => {
  const { text } = req.body;

  if (!text) {
    res.status(400).send({ error: 'Text is required' });
    return;
  }

  console.log('Received text: ', text);

  const prompt = `
    Extract a list of items from the following receipt text. Ignore subtotal, total and tax unless labeled. 
    Return a JSON array like: [ { "name": "Item Name", "quantity": 1, "price": 10.00 }, ... ].The receipt may contain multiple items, and the format may vary.  
    Here is the Text:\n\n${text}
    `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
    });

    console.log('peek: ', completion.choices[0].message);
    // const tableData = response.data.choices[0].text;
    const tableData = completion.choices[0].message.content;
    res.send({ table: tableData });
  } catch (error) {
    console.error('Error processing text:', error);
    res.status(500).send({
      error: { message: 'Failed to process text', data: null },
      error2: error,
    });
  }
});

export default route;

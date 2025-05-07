const extractText = (text: string) => `
Extract a list of items from the following receipt text. Ignore subtotal, total and tax unless labeled. 
Return a JSON array like: [ { "name": "Item Name", "quantity": 1, "price": 10.00 }, ... ].The receipt may contain multiple items, and the format may vary.  
Here is the Text:\n\n${text}
`;

const buildPrompt = {
  extractText,
};

export { buildPrompt };

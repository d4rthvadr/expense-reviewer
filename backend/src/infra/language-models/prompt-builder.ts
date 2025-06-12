import { ExpenseItem } from '@domain/models/expense.model';
import { BudgetPerCategory } from '@infra/queues/expense-review.queue';

const extractTextFromInvoice = (text: string) => `
Extract a list of items from the following receipt text. Ignore subtotal, total and tax unless labeled. 
Return a JSON array like: [ { "name": "Item Name", "quantity": 1, "price": 10.00 }, ... ].The receipt may contain multiple items, and the format may vary.
i expect your response to be on only the JSON array.  
Here is the Text:\n\n${text}
`;

const getBudgetInTextFormat = (budgets: BudgetPerCategory[]): string => {
  if (!budgets || budgets.length === 0) {
    return 'No budgets found.';
  }
  const budgetSet = new Set();
  return budgets
    .map((budget, i) => {
      if (budgetSet.has(budget.category)) {
        return;
      }
      budgetSet.add(budget.category);
      return `${i + 1}. ${budget.category} - ${budget.budget.toFixed(2)} ${budget.currency}`;
    })
    .filter(Boolean)
    .join('\n');
};

const getItemInTextFormat = (items: ExpenseItem[]): string => {
  return items
    .map((item, i) => {
      const totalAmount = item.amount * (item.qty ?? 1);
      return `${i + 1}.  ${item.qty || 1}x ${item.name} (${item.amount.toFixed(2)} each) - ${item.description ?? item.name}.
    > Total: ${item.currency} ${totalAmount.toFixed(2)}: Category: ${item.category}`;
    })
    .join('\n');
};

const reviewUserExpense = (
  items: ExpenseItem[],
  budgets: BudgetPerCategory[]
) => {
  const itemsText = getItemInTextFormat(items);
  const budgetText = getBudgetInTextFormat(budgets);

  const template = `You are an intelligent financial assistant helping a user review their expenses.
Here is the user's **monthly budget by category**:

items:\n\n${itemsText}

Category budget:\n\n${budgetText}

Instructions:
- For each item, compare the total cost to its category budget
- Point out which items or categories are over budget
- Suggest ways to save or cut back
- Highlight any spending trends or patterns
- Be friendly, concise, and helpful

`;
  return template;
};

const buildPrompt = {
  extractTextFromInvoice,
  reviewUserExpense,
};

export { buildPrompt };

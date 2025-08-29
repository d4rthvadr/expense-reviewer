import { BudgetVsTransactionData } from '@domain/repositories/analytics.repository';

const getItemInTextFormat = (items: BudgetVsTransactionData[]): string => {
  return items
    .map((item, i) => {
      return `${i + 1}.  Transaction Amount: (${item.transactionAmount.toFixed(2)}) §BudgetAmount: ${item.budgetAmount.toFixed(2)}. Remaining: ${item.remaining.toFixed(2)}. Category: ${item.category}.
  `;
    })
    .join('\n');
};

const reviewUserTransaction = (items: BudgetVsTransactionData[]) => {
  const itemsText = getItemInTextFormat(items);

  const template = `You are a financial assistant that analyzes a user’s budget and transactions. 
Your job is to review spending data by category, compare transactions to budgets, and provide clear, human-readable insights and recommendations.
Here is the user's **monthly budget with transactions**:

Input:
\n\n${itemsText}

Input Format:
You will receive an array of JSON objects, each representing a budget category with the following fields:

- category (string) – name of the spending category

- budgetAmount (number) – allocated budget for this category

- expenseAmount (number) – actual spending recorded

- currency (string) – the currency used (e.g., USD)

- utilizationPercentage (number) – percentage of budget spent

- remaining (number) – how much money is left (negative if overspent)


Output Requirements:

1. Category-Level Analysis:

  - Highlight overspent categories (negative remaining, OVER_BUDGET or NO_BUDGET).

  - Point out categories with unused budget (UNDER_BUDGET).

  - For NO_BUDGET categories, explain that spending occurred without an allocated budget.

2. Overall Spending Health:

  - Total budget vs total expenses.

  - How many categories are over/under/no budget.

  - A short summary of spending behavior (e.g., "You spent without a budget on insurance, but food is still within limits").

3. Actionable Recommendations:

  - Suggest reducing or reallocating budgets.

  - Suggest creating budgets for categories with recurring expenses but no budget.

  - Highlight potential risks (e.g., overspending trends).

4. Tone:

  - Friendly, concise, and clear.

  - Avoid jargon. Assume the user wants practical insights, not just raw numbers.

`;
  return template;
};

const buildPrompt = {
  reviewUserTransaction,
  // Add more prompt builders here as needed
};

export { buildPrompt };

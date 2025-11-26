/* eslint-disable no-unused-vars */
enum TemplateNames {
  BASE = 'base',
  WELCOME = 'welcome',
  EXPENSE_REVIEWED = 'expense_reviewed',
  TRANSACTION_REVIEW_RESULT = 'transaction_review_result',
}

type TemplatePayloadArgs = {
  [TemplateNames.WELCOME]: {
    name: string;
  };
  [TemplateNames.EXPENSE_REVIEWED]: {
    name: string;
    month: string;
    reviewComment: string;
    link: string;
  };
  [TemplateNames.TRANSACTION_REVIEW_RESULT]: {
    userEmail: string;
    reviewText: string;
    reviewHtml: string;
    periodFrom: string;
    periodTo: string;
  };
  [TemplateNames.BASE]: {
    title: string;
    content: string;
    footer?: string;
  };
};

type TemplateWithPayloadArgs<T extends keyof TemplatePayloadArgs> =
  TemplatePayloadArgs[T];

export { TemplatePayloadArgs, TemplateNames, TemplateWithPayloadArgs };

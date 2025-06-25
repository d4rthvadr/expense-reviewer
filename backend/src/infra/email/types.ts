/* eslint-disable no-unused-vars */
enum TemplateNames {
  BASE = 'base',
  WELCOME = 'welcome',
  EXPENSE_REVIEWED = 'expense_reviewed',
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
  [TemplateNames.BASE]: {
    title: string;
    content: string;
    footer?: string;
  };
};

type TemplateWithPayloadArgs<T extends keyof TemplatePayloadArgs> =
  TemplatePayloadArgs[T];

export { TemplatePayloadArgs, TemplateNames, TemplateWithPayloadArgs };

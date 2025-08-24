const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Expense Reviewer API',
      version: '1.0.0',
      description: 'API documentation for the Expense Tracker application',
    },
    servers: [
      {
        url: 'http://localhost:3005',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Budget: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the budget',
            },
            name: {
              type: 'string',
              description: 'Name of the budget',
              nullable: true,
            },
            userId: {
              type: 'string',
              description: 'ID of the user who owns this budget',
              nullable: true,
            },
            amount: {
              type: 'number',
              description: 'Budget amount in the specified currency',
            },
            amountUsd: {
              type: 'number',
              description: 'Budget amount converted to USD at creation time',
            },
            isRecurring: {
              type: 'boolean',
              description: 'Whether this budget is recurring',
              default: false,
            },
            recurringTemplateId: {
              type: 'string',
              description:
                'ID of the recurring template (only set when isRecurring = true)',
              nullable: true,
            },
            currency: {
              type: 'string',
              enum: ['USD', 'EUR', 'GHS'],
              description: 'Currency of the budget amount',
              default: 'USD',
            },
            category: {
              type: 'string',
              enum: [
                'FOOD',
                'TRANSPORT',
                'UTILITIES',
                'ENTERTAINMENT',
                'HEALTH',
                'EDUCATION',
                'SHOPPING',
                'MISCELLANEOUS',
                'PERSONAL_AND_LIFESTYLE',
                'TRAVEL',
                'GIFTS_OR_DONATIONS',
                'HOUSING',
                'SAVINGS_OR_INVESTMENTS',
                'INSURANCE',
                'OTHER',
              ],
              description: 'Category of the budget',
              default: 'OTHER',
            },
            description: {
              type: 'string',
              description: 'Optional description of the budget',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date when the budget was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date when the budget was last updated',
            },
          },
          required: [
            'id',
            'amount',
            'amountUsd',
            'isRecurring',
            'currency',
            'category',
            'createdAt',
            'updatedAt',
          ],
        },
        CreateBudgetRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the budget',
            },
            amount: {
              type: 'number',
              description: 'Budget amount in the specified currency',
            },
            currency: {
              type: 'string',
              enum: ['USD', 'EUR', 'GHS'],
              description: 'Currency of the budget amount',
              default: 'USD',
            },
            category: {
              type: 'string',
              enum: [
                'FOOD',
                'TRANSPORT',
                'UTILITIES',
                'ENTERTAINMENT',
                'HEALTH',
                'EDUCATION',
                'SHOPPING',
                'MISCELLANEOUS',
                'PERSONAL_AND_LIFESTYLE',
                'TRAVEL',
                'GIFTS_OR_DONATIONS',
                'HOUSING',
                'SAVINGS_OR_INVESTMENTS',
                'INSURANCE',
                'OTHER',
              ],
              description: 'Category of the budget',
            },
            description: {
              type: 'string',
              description: 'Optional description of the budget',
            },
            isRecurring: {
              type: 'boolean',
              description: 'Whether this budget is recurring',
              default: false,
            },
            recurringTemplateId: {
              type: 'string',
              description:
                'ID of the recurring template (required when isRecurring is true)',
            },
          },
          required: ['amount', 'category'],
        },
        UpdateBudgetRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the budget',
            },
            amount: {
              type: 'number',
              description: 'Budget amount in the specified currency',
            },
            currency: {
              type: 'string',
              enum: ['USD', 'EUR', 'GHS'],
              description: 'Currency of the budget amount',
            },
            category: {
              type: 'string',
              enum: [
                'FOOD',
                'TRANSPORT',
                'UTILITIES',
                'ENTERTAINMENT',
                'HEALTH',
                'EDUCATION',
                'SHOPPING',
                'MISCELLANEOUS',
                'PERSONAL_AND_LIFESTYLE',
                'TRAVEL',
                'GIFTS_OR_DONATIONS',
                'HOUSING',
                'SAVINGS_OR_INVESTMENTS',
                'INSURANCE',
                'OTHER',
              ],
              description: 'Category of the budget',
            },
            description: {
              type: 'string',
              description: 'Optional description of the budget',
            },
            isRecurring: {
              type: 'boolean',
              description: 'Whether this budget is recurring',
            },
            recurringTemplateId: {
              type: 'string',
              description:
                'ID of the recurring template (required when isRecurring is true)',
            },
          },
        },
        BudgetListResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Budget',
              },
              description: 'Array of budget objects',
            },
            pagination: {
              type: 'object',
              properties: {
                total: {
                  type: 'number',
                  description: 'Total number of budgets',
                },
                page: {
                  type: 'number',
                  description: 'Current page number',
                },
                limit: {
                  type: 'number',
                  description: 'Number of items per page',
                },
                totalPages: {
                  type: 'number',
                  description: 'Total number of pages',
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            error: {
              type: 'string',
              description: 'Error type or code',
            },
          },
          required: ['message'],
        },
        ValidationError: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Validation error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field that failed validation',
                  },
                  message: {
                    type: 'string',
                    description: 'Validation error message for the field',
                  },
                },
              },
              description: 'Array of field-specific validation errors',
            },
          },
          required: ['message'],
        },
      },
    },
  },
  apis: [
    './src/api/routes/*.ts',
    './src/api/controllers/*.ts',
    './src/domain/models/*.ts',
  ],
};

export default swaggerOptions;

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
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/domain/models/*.ts',
  ],
};

export default swaggerOptions;

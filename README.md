# Transaction Tracker (Personal Finance Management System)

## Overview

The Transaction Tracker is a comprehensive backend application designed to help users manage their financial transactions efficiently. It provides APIs for creating, updating, and retrieving both expenses and income, along with budgets and categories. The application integrates with OpenAI to analyze spending patterns and provide periodic reviews and recommendations, helping users make better financial decisions.

## Key Features

- **Unified Transaction Management**: Track both expenses and income in a single, cohesive system
- **Transaction Type Support**: Filter and analyze by EXPENSE or INCOME types
- **AI-Powered Reviews**: Automated transaction analysis and personalized recommendations
- **Budget vs Transaction Analysis**: Compare actual spending against planned budgets
- **Comprehensive Analytics**: Time-based transaction insights with granular filtering
- **Transaction Review System**: Detailed review and approval workflows
- **Queue-Based Processing**: Background processing for scalable transaction analysis
- **Multi-Currency Support**: Handle transactions in different currencies with conversion
- **RESTful API Design**: Clean, intuitive endpoints following REST principles

## Motivation

The motivation behind this project is to:

- Leverage AI to provide insightful reviews and actionable recommendations for managing personal finances.
- Create a unified system for tracking both expenses and income to provide comprehensive financial insights.
- Demonstrate how AI can be integrated into daily life to solve real-world problems, such as financial management and budgeting.
- Serve as a learning platform for implementing modern backend technologies, AI-driven solutions, and scalable system architecture.
- Provide a foundation for building comprehensive personal finance management tools.

## Setup and Installation

### Prerequisites

- Node.js (v20 or later)
- npm or yarn
- Docker Desktop or OrbStack. ( I am using orbstack)
- PostgreSQL (for database)

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/d4rthvadr/expense-reviewer.git
   cd expense-reviewer
   ```

2. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Bring up docker-compose file to start redis and postgres ( in root dir).

   ```shell
   docker-compose up -d

   ```

4. Set up environment variables:
   Create a `.env` file in the `backend` directory with the following content:

   ```env
   OPENAI_API_KEY=your_openai_api_key
   DATABASE_URL=your_postgresql_connection_string
   PORT=3000
   ```

5. Set up the database:
   Switch into backend directory and run the following commands to initialize the database:

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

6. Start the server in backend directory
   ```bash
   npm run dev
   ```
   The server will be available at `http://localhost:3000`.

## Technologies Used

- **Node.js**: JavaScript runtime for building the backend.
- **Express.js**: Web framework for creating RESTful APIs.
- **Prisma**: ORM for database management.
- **Redis**: Caching and background queue management.
- **PostgreSQL**: Relational database for storing data.
- **OpenAI API**: For analyzing expenses and generating recommendations.
- **Docker**: For containerized application and deployment.
- **TypeScript**: For type-safe development.
- **Winston**: For logging.

## Folder Structure

```
expense-reviewer/
├── docker-compose.yml          # Docker Compose configuration
├── README.md                   # Project documentation
├── backend/                    # Backend application
│   ├── db.md                   # Database schema documentation
│   ├── Dockerfile              # Dockerfile for backend
│   ├── package.json            # Node.js dependencies
│   ├── README.md               # Backend-specific documentation
│   ├── .eslintrc.js            # ESLint configuration
│   ├── .prettierrc             # Prettier configuration
│   ├── tsconfig.json           # TypeScript configuration
│   ├── docs/                   # API and project documentation
│   │   ├── api.md
│   │   ├── commands.md
│   │   ├── db.md
│   │   └── overview.md
│   ├── prisma/                 # Prisma ORM configuration
│   │   ├── schema.prisma       # Prisma schema definition
│   │   ├── migrations/         # Database migrations
│   └── src/                    # Source code
│       ├── app.ts              # Express app setup
│       ├── db/                 # Database-related modules
│       ├── docs/               # Project and API documentation
│       ├── app.ts              # Express app setup
│       ├── server.ts           # Server entry point
│       ├── controllers/        # API controllers
│       ├── domain/             # Domain models and business logic
│       ├── infra/              # Infrastructure and integrations
│       ├── libs/               # Utility libraries
│       ├── middlewares/        # Express middlewares
│       ├── routes/             # API routes
│       └── types/              # TypeScript type definitions
├── docker-compose.yml          # Docker Compose file for project services
├── Dockerfile.ollama           # Dockerfile for Ollama integration
├── init-scripts/               # Initialization scripts (e.g., database setup)
└── client/                     # Placeholder for frontend (if applicable)
```

## Usage

### API Endpoints

#### Transaction Management

```bash
# Transaction CRUD Operations
POST   /api/transactions                    # Create new transaction (expense or income)
GET    /api/transactions                    # List transactions with filtering and pagination
GET    /api/transactions/:transactionId     # Get specific transaction details
PUT    /api/transactions/:transactionId     # Update existing transaction
DELETE /api/transactions/:transactionId     # Delete transaction
```

#### Transaction Reviews

```bash
# Transaction Review System
POST   /api/transaction-reviews             # Create transaction review
GET    /api/transaction-reviews             # List reviews with pagination
GET    /api/transaction-reviews/:reviewId   # Get specific review details
PUT    /api/transaction-reviews/:reviewId   # Update review
DELETE /api/transaction-reviews/:reviewId   # Delete review
```

#### Enhanced Analytics

```bash
# Analytics with Transaction Type Support
GET    /api/analytics/transactions-over-time     # Transaction analytics with type filtering
GET    /api/analytics/budget-vs-transactions     # Budget comparison analysis
GET    /api/analytics/budgets                    # Budget data and insights
```

#### User & Budget Management

```bash
# User and Budget Operations
GET    /api/users/:userId                   # Get user profile
PUT    /api/users/:userId                   # Update user information
POST   /api/budgets                         # Create budget
GET    /api/budgets                         # List budgets
PUT    /api/budgets/:budgetId              # Update budget
DELETE /api/budgets/:budgetId              # Delete budget
```

### Sample Usage

#### 1. Create an Expense Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   -d '{
      "name": "Groceries at SuperMart",
      "amount": 45.99,
      "currency": "USD",
      "type": "EXPENSE",
      "category": "FOOD_AND_DINING",
      "description": "Weekly grocery shopping",
      "transactionItems": [
        {
          "name": "Organic Milk",
          "quantity": 2,
          "unitPrice": 3.50,
          "category": "FOOD_AND_DINING"
        },
        {
          "name": "Whole Wheat Bread",
          "quantity": 1,
          "unitPrice": 2.99,
          "category": "FOOD_AND_DINING"
        }
      ]
   }'
```

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "id": "trans_123456789",
    "name": "Groceries at SuperMart",
    "amount": 45.99,
    "currency": "USD",
    "type": "EXPENSE",
    "category": "FOOD_AND_DINING",
    "description": "Weekly grocery shopping",
    "userId": "user_123",
    "transactionItems": [
      {
        "id": "item_001",
        "name": "Organic Milk",
        "quantity": 2,
        "unitPrice": 3.5,
        "totalPrice": 7.0,
        "category": "FOOD_AND_DINING"
      }
    ],
    "createdAt": "2025-08-26T12:34:56.000Z",
    "updatedAt": "2025-08-26T12:34:56.000Z"
  },
  "message": "Transaction created successfully"
}
```

#### 2. Create an Income Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   -d '{
      "name": "Freelance Project Payment",
      "amount": 1500.00,
      "currency": "USD",
      "type": "INCOME",
      "category": "SALARY",
      "description": "Client project completion - Q3 2025"
   }'
```

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "id": "trans_987654321",
    "name": "Freelance Project Payment",
    "amount": 1500.0,
    "currency": "USD",
    "type": "INCOME",
    "category": "SALARY",
    "description": "Client project completion - Q3 2025",
    "userId": "user_123",
    "createdAt": "2025-08-26T12:45:00.000Z",
    "updatedAt": "2025-08-26T12:45:00.000Z"
  },
  "message": "Income transaction created successfully"
}
```

#### 3. Update a Transaction

```bash
curl -X PUT http://localhost:3000/api/transactions/trans_123456789 \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   -d '{
      "amount": 52.47,
      "description": "Groceries and household items"
   }'
```

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "id": "trans_123456789",
    "name": "Groceries at SuperMart",
    "amount": 52.47,
    "currency": "USD",
    "type": "EXPENSE",
    "category": "FOOD_AND_DINING",
    "description": "Groceries and household items",
    "updatedAt": "2025-08-26T13:15:00.000Z"
  },
  "message": "Transaction updated successfully"
}
```

#### 4. Get Transaction Analytics with Filtering

```bash
# Get expense analytics for the current year, grouped by month
curl "http://localhost:3000/api/analytics/transactions-over-time?dateFrom=2025-01-01&dateTo=2025-12-31&groupBy=month&transactionType=EXPENSE" \
   -H "Authorization: Bearer YOUR_TOKEN"

# Get income analytics for the last quarter
curl "http://localhost:3000/api/analytics/transactions-over-time?dateFrom=2025-06-01&dateTo=2025-08-31&groupBy=week&transactionType=INCOME" \
   -H "Authorization: Bearer YOUR_TOKEN"
```

**Sample Analytics Response:**

```json
{
  "success": true,
  "data": [
    {
      "period": "2025-01",
      "totalAmount": 2845.67,
      "transactionCount": 45
    },
    {
      "period": "2025-02",
      "totalAmount": 3102.34,
      "transactionCount": 52
    }
  ],
  "message": "Transaction analytics retrieved for 12 periods"
}
```

#### 5. Create a Budget

```bash
curl -X POST http://localhost:3000/api/budgets \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   -d '{
      "userId": "user_123",
      "category": "FOOD_AND_DINING",
      "amount": 500.00,
      "currency": "USD",
      "period": "2025-08"
   }'
```

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "id": "budget_201",
    "userId": "user_123",
    "category": "FOOD_AND_DINING",
    "amount": 500.0,
    "currency": "USD",
    "period": "2025-08",
    "createdAt": "2025-08-26T12:40:00.000Z"
  },
  "message": "Budget created successfully"
}
```

#### 6. Get Budget vs Transaction Analysis

```bash
curl "http://localhost:3000/api/analytics/budget-vs-transactions?dateFrom=2025-08-01&dateTo=2025-08-31" \
   -H "Authorization: Bearer YOUR_TOKEN"
```

**Sample Budget Analysis Response:**

```json
{
  "success": true,
  "data": [
    {
      "category": "FOOD_AND_DINING",
      "budgetAmount": 500.0,
      "transactionAmount": 387.5,
      "currency": "USD",
      "utilizationPercentage": 77.5,
      "remaining": 112.5,
      "status": "UNDER_BUDGET"
    },
    {
      "category": "TRANSPORTATION",
      "budgetAmount": 200.0,
      "transactionAmount": 245.8,
      "currency": "USD",
      "utilizationPercentage": 122.9,
      "remaining": -45.8,
      "status": "OVER_BUDGET"
    }
  ],
  "message": "Budget vs transaction comparison retrieved for 8 categories"
}
```

## Additional Content

### AI-Powered Transaction Analysis

The application uses OpenAI to:

- **Analyze Transaction Patterns**: Identify spending and earning trends across different categories and time periods.
- **Provide Personalized Reviews**: Generate detailed financial reviews based on user's transaction history.
- **Budget Optimization**: Suggest budget adjustments based on actual spending patterns.
- **Income vs Expense Analysis**: Compare income and expense trends to provide comprehensive financial insights.
- **Category-Based Recommendations**: Provide targeted suggestions for reducing expenses or optimizing spending in specific categories.
- **Automated Review Generation**: Create periodic financial health reports with actionable recommendations.

### Enhanced Features

#### Transaction Type Support

- **Expense Tracking**: Traditional expense management with detailed categorization
- **Income Tracking**: Comprehensive income recording from various sources (salary, freelance, investments, etc.)
- **Unified Analytics**: Combined analysis of income and expenses for complete financial picture

#### Queue-Based Processing

- **Transaction Review Queue**: Background processing for AI-powered transaction analysis
- **Scalable Architecture**: Handle large volumes of transactions efficiently
- **Migration Support**: Smooth transition from expense-only to transaction-based system

#### Multi-Currency Support

- **Currency Conversion**: Automatic conversion between different currencies
- **Real-time Rates**: Integration with currency exchange APIs
- **User Preferences**: Support for user's preferred currency display

### API Documentation

Detailed API documentation is available in the `backend/docs/api.md` file. It includes information about:

- Complete endpoint reference with request/response examples
- Authentication and authorization requirements
- Error handling and status codes
- Rate limiting and best practices

### Database Schema

The database schema is documented in `backend/db.md` and managed using Prisma. Core entities include:

- **Transaction**: Unified table for expenses and income with type field (EXPENSE/INCOME)
- **TransactionItem**: Individual line items within a transaction
- **TransactionReview**: AI-generated and manual reviews for transactions
- **User**: User management with preferences and settings
- **Budget**: Budget planning and tracking by category
- **Category**: Predefined and custom transaction categories

#### Migration from Expense System

- All existing expense data automatically migrated to transaction format
- Expense records converted to EXPENSE-type transactions
- Data integrity maintained throughout migration process

### Environment Configuration

```env
# Required Configuration
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/transaction_tracker
REDIS_URL=redis://localhost:6379

# Optional Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Queue Configuration
TRANSACTION_REVIEW_QUEUE=transaction-review-queue
QUEUE_MIGRATION_MODE=false
USE_NEW_QUEUE=true

# Currency & Analytics
DEFAULT_CURRENCY=USD
ANALYTICS_CACHE_TTL=3600
```

### Logging

The application uses Winston for comprehensive logging:

- **Application Logs**: Stored in `backend/logs/combined.log`
- **Error Logs**: Stored in `backend/logs/error.log`
- **Request Logs**: HTTP request/response logging with performance metrics
- **Queue Logs**: Background job processing logs

### Future Enhancements

- **Frontend Application**: React-based web interface for user interaction
- **Mobile Application**: React Native mobile app for on-the-go transaction management
- **Advanced Authentication**: OAuth integration with major providers
- **Recurring Transactions**: Support for automatic recurring income and expenses
- **Investment Tracking**: Portfolio management and investment performance analysis
- **Financial Goal Setting**: Goal tracking and progress monitoring
- **Advanced AI Integration**: More sophisticated financial advisory features
- **Multi-User Support**: Family and business account management
- **Reporting Engine**: Comprehensive financial reporting and export capabilities

---

Feel free to contribute to the project by submitting issues or pull requests. Let us know if you have any questions or suggestions!

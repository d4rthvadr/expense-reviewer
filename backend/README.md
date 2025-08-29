# Transaction Tracker Backend

This is the backend for the Transaction Tracker application. It provides comprehensive APIs to process and manage financial transaction data (both expenses and income), including integration with OpenAI's GPT models for transaction analysis, automated reviews, and personalized financial recommendations.

## Features

- **Unified Transaction Management**: Handle both expenses and income through a single, cohesive API
- **Transaction Type Support**: Filter and analyze by EXPENSE or INCOME types with granular control
- **Transaction Review System**: Automated and manual review workflows for financial oversight
- **Enhanced Analytics**: Time-based analytics with transaction type filtering and trend analysis
- **Budget Analysis**: Compare actual transactions against planned budgets with variance reporting
- **AI-Powered Insights**: OpenAI integration for intelligent transaction analysis and recommendations
- **Queue-Based Processing**: Background processing system for scalable transaction review generation
- **Multi-Currency Support**: Handle transactions in different currencies with automatic conversion
- **RESTful API Design**: Comprehensive endpoints following REST principles and best practices
- **Docker Support**: Containerized deployment ready for production environments

## Key Capabilities

### Transaction Management

- Create, read, update, and delete transactions (expenses and income)
- Support for complex transaction items with detailed breakdowns
- Category-based organization with customizable categories
- Multi-currency support with real-time conversion rates

### Analytics & Reporting

- Time-based transaction analytics with flexible grouping (day/week/month)
- Budget vs actual transaction comparison analysis
- Transaction type filtering for focused insights
- Trend analysis and pattern recognition

### AI Integration

- Automated transaction pattern analysis
- Personalized financial recommendations
- Budget optimization suggestions
- Spending behavior insights

## Prerequisites

- Node.js (v20 or later)
- npm or yarn
- Docker (optional, for containerized deployment)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd expense-tracker/backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `backend` directory with the following content:

   ```env
   # Required Configuration
   OPENAI_API_KEY=your_openai_api_key
   DATABASE_URL=postgresql://user:password@localhost:5432/transaction_tracker
   REDIS_URL=redis://localhost:6379
   PORT=3000

   # Optional Configuration
   NODE_ENV=development
   LOG_LEVEL=info
   DEFAULT_CURRENCY=USD

   # Queue Configuration
   TRANSACTION_REVIEW_QUEUE=transaction-review-queue
   QUEUE_MIGRATION_MODE=false
   USE_NEW_QUEUE=true

   # Analytics Configuration
   ANALYTICS_CACHE_TTL=3600
   ```

4. Set up the database:
   Initialize the database with Prisma migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## Usage

### Start the Server

Run the following command to start the server:

```bash
npm run start
```

The server will be available at `http://localhost:3000`.

### API Endpoints

#### Transaction Management

- **POST `/api/transactions`** - Create new transaction (expense or income)
- **GET `/api/transactions`** - List transactions with filtering and pagination
- **GET `/api/transactions/:id`** - Get specific transaction details
- **PUT `/api/transactions/:id`** - Update existing transaction
- **DELETE `/api/transactions/:id`** - Delete transaction

#### Transaction Reviews

- **POST `/api/transaction-reviews`** - Create transaction review
- **GET `/api/transaction-reviews`** - List reviews with pagination
- **GET `/api/transaction-reviews/:id`** - Get specific review
- **PUT `/api/transaction-reviews/:id`** - Update review
- **DELETE `/api/transaction-reviews/:id`** - Delete review

#### Analytics

- **GET `/api/analytics/transactions-over-time`** - Transaction analytics with type filtering
  - Query parameters: `dateFrom`, `dateTo`, `groupBy`, `transactionType`
- **GET `/api/analytics/budget-vs-transactions`** - Budget comparison analysis
  - Query parameters: `dateFrom`, `dateTo`
- **GET `/api/analytics/budgets`** - Budget data and insights

#### User & Budget Management

- **GET `/api/users/:id`** - Get user profile
- **PUT `/api/users/:id`** - Update user information
- **POST `/api/budgets`** - Create budget
- **GET `/api/budgets`** - List budgets
- **PUT `/api/budgets/:id`** - Update budget
- **DELETE `/api/budgets/:id`** - Delete budget

### Sample API Usage

#### Create Expense Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Coffee Shop",
    "amount": 4.50,
    "currency": "USD",
    "type": "EXPENSE",
    "category": "FOOD_AND_DINING",
    "description": "Morning coffee"
  }'
```

#### Create Income Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Freelance Payment",
    "amount": 1500.00,
    "currency": "USD",
    "type": "INCOME",
    "category": "SALARY",
    "description": "Client project payment"
  }'
```

#### Get Transaction Analytics

```bash
curl "http://localhost:3000/api/analytics/transactions-over-time?dateFrom=2025-01-01&dateTo=2025-12-31&groupBy=month&transactionType=EXPENSE" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Docker

### Build the Docker Image

```bash
docker build -t expense-tracker-backend .
```

### Run the Docker Container

```bash
docker run -p 3000:3000 --env-file .env expense-tracker-backend
```

## Database Schema

### Core Entities

#### Transaction

- **Purpose**: Unified table for both expenses and income
- **Key Fields**: `id`, `name`, `amount`, `currency`, `type` (EXPENSE/INCOME), `category`, `userId`
- **Features**: Multi-currency support, detailed categorization, user association

#### TransactionItem

- **Purpose**: Individual line items within a transaction
- **Key Fields**: `id`, `transactionId`, `name`, `quantity`, `unitPrice`, `category`
- **Features**: Detailed breakdown of complex transactions

#### TransactionReview

- **Purpose**: Review and analysis system for transactions
- **Key Fields**: `id`, `userId`, `reviewText`, `status`, `createdAt`
- **Features**: AI-generated reviews, manual review capability

#### Budget

- **Purpose**: Budget planning and tracking by category
- **Key Fields**: `id`, `userId`, `category`, `amount`, `currency`, `period`
- **Features**: Category-based budgeting, period tracking

#### User

- **Purpose**: User management and preferences
- **Key Fields**: `id`, `email`, `preferences`, `defaultCurrency`
- **Features**: Personalized settings, currency preferences

### Migration from Expense System

#### Data Migration

- **Automatic Conversion**: All existing expense records converted to EXPENSE-type transactions
- **Data Preservation**: Complete data integrity maintained during migration
- **Relationship Mapping**: Expense items → TransactionItems, ExpenseReviews → TransactionReviews

#### Queue Migration

- **Queue Names**: `expense-review-queue` → `transaction-review-queue`
- **Migration Strategy**: Dual processing during transition period
- **Job Compatibility**: Existing jobs processed by updated handlers

## Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   ├── migrations/             # Database migration files
│   └── seed.ts                 # Database seeding scripts
├── src/
│   ├── api/                    # API layer
│   │   ├── controllers/        # Request handlers
│   │   ├── middlewares/        # Express middlewares
│   │   ├── routes/             # Route definitions
│   │   └── types/              # API type definitions
│   ├── domain/                 # Business logic layer
│   │   ├── models/             # Domain models
│   │   ├── repositories/       # Data access layer
│   │   ├── services/           # Business services
│   │   ├── factories/          # Object factories
│   │   └── enum/               # Domain enumerations
│   ├── infra/                  # Infrastructure layer
│   │   ├── db/                 # Database configuration
│   │   ├── logger/             # Logging configuration
│   │   ├── email/              # Email services
│   │   ├── queues/             # Background job processing
│   │   └── language-models/    # AI integration
│   ├── config/                 # Application configuration
│   ├── app.ts                  # Express application setup
│   └── server.ts               # Server entry point
├── logs/                       # Application logs
├── docs/                       # Documentation
├── tests/                      # Test files
├── .env                        # Environment variables
├── Dockerfile                  # Docker configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## Development

### Run in Development Mode

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Database Operations

```bash
# Generate Prisma client
npm run db:gen

# Create new migration
npm run db:migrate

# Deploy migrations
npm run db:deploy
```

### Code Quality

```bash
# Run linting with auto-fix
npm run lint:fix

# Format code
npm run format
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Production Deployment

### Environment Setup

1. Set production environment variables
2. Configure database connection
3. Set up Redis for queue processing
4. Configure OpenAI API access

### Database Migration

```bash
# Run production migrations
npx prisma migrate deploy

# Generate production client
npx prisma generate
```

### Queue Processing

Ensure background workers are running for transaction review processing:

```bash
# Production queue processing
npm run start:worker
```

## Troubleshooting

### Common Issues

#### Database Connection

- Verify DATABASE_URL format and credentials
- Ensure PostgreSQL is running and accessible
- Check network connectivity and firewall settings

#### Queue Processing

- Verify Redis connection and availability
- Check queue configuration and naming
- Monitor queue worker logs for errors

#### AI Integration

- Validate OpenAI API key and quota
- Check API rate limits and usage
- Monitor AI service response times

### Migration Issues

If migrating from expense system:

1. Backup existing data before migration
2. Run migration in maintenance mode
3. Verify data integrity post-migration
4. Update queue configurations gradually

## License

This project is licensed under the MIT License.

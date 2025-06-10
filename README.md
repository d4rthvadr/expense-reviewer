# Expense Reviewer

## Overview

The Expense Reviewer is a backend application designed to help users manage their expenses efficiently. It provides APIs for creating, updating, and retrieving expenses, users, and categories. The application integrates with OpenAI to analyze expenses and provide periodic reviews and recommendations, helping users make better financial decisions.

## Motivation

The motivation behind this project is to:

- Leverage AI to provide insightful reviews and actionable recommendations for managing expenses.
- Demonstrate how AI can be integrated into daily life to solve real-world problems, such as financial management.
- Serve as a learning platform for implementing modern backend technologies and AI-driven solutions.

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

### Sample Usage

#### 1. Create an Expense

```bash
curl -X POST http://localhost:3000/api/expenses \
   -H "Content-Type: application/json" \
   -d '{
      "userId": "1",
      "amount": 45.99,
      "categoryId": "2",
      "description": "Groceries at SuperMart",
      "date": "2024-06-10"
   }'
```

**Sample Response:**

```json
{
  "id": "101",
  "userId": "1",
  "amount": 45.99,
  "categoryId": "2",
  "description": "Groceries at SuperMart",
  "date": "2024-06-10T00:00:00.000Z",
  "createdAt": "2024-06-10T12:34:56.000Z"
}
```

#### 2. Update an Expense

```bash
curl -X PUT http://localhost:3000/api/expenses/101 \
   -H "Content-Type: application/json" \
   -d '{
      "amount": 50.00,
      "description": "Groceries and snacks"
   }'
```

**Sample Response:**

```json
{
  "id": "101",
  "userId": "1",
  "amount": 50.0,
  "categoryId": "2",
  "description": "Groceries and snacks",
  "date": "2024-06-10T00:00:00.000Z",
  "updatedAt": "2024-06-10T13:00:00.000Z"
}
```

#### 3. Create a Budget

```bash
curl -X POST http://localhost:3000/api/budgets \
   -H "Content-Type: application/json" \
   -d '{
      "userId": "1",
      "categoryId": "2",
      "amount": 300.00,
      "month": "2024-06"
   }'
```

**Sample Response:**

```json
{
  "id": "201",
  "userId": "1",
  "categoryId": "2",
  "amount": 300.0,
  "month": "2024-06",
  "createdAt": "2024-06-10T12:40:00.000Z"
}
```

#### 4. Update a Budget

```bash
curl -X PUT http://localhost:3000/api/budgets/201 \
   -H "Content-Type: application/json" \
   -d '{
      "amount": 350.00
   }'
```

**Sample Response:**

```json
{
  "id": "201",
  "userId": "1",
  "categoryId": "2",
  "amount": 350.0,
  "month": "2024-06",
  "updatedAt": "2024-06-10T13:10:00.000Z"
}
```

## Additional Content

### AI-Powered Reviews and Recommendations

The application uses OpenAI to:

- Analyze expense patterns and trends.
- Provide periodic reviews of spending habits.
- Generate actionable recommendations to optimize financial management.

### API Documentation

Detailed API documentation is available in the `backend/docs/api.md` file. It includes information about endpoints, request/response formats, and examples.

### Database Schema

The database schema is documented in `backend/db.md` and managed using Prisma. It includes entities like `User`, `Expense`, `Category`, and `Expense Items`.

### Logging

The application uses Winston for logging. Logs are stored in the `backend/logs/` directory.

### Future Enhancements

- Add a frontend for user interaction.
- Implement authentication and authorization.
- Add support for recurring expenses.
- Enhance AI integration for more advanced text processing and recommendations.

---

Feel free to contribute to the project by submitting issues or pull requests. Let us know if you have any questions or suggestions!

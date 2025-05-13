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
- Docker (optional, for containerized deployment)
- PostgreSQL (for database)

### Installation Steps

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd expense-reviewer
   ```

2. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `backend` directory with the following content:

   ```env
   OPENAI_API_KEY=your_openai_api_key
   DATABASE_URL=your_postgresql_connection_string
   PORT=3000
   ```

4. Set up the database:
   Run the following commands to initialize the database:

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. Start the server:
   ```bash
   npm run start
   ```
   The server will be available at `http://localhost:3000`.

## Technologies Used

- **Node.js**: JavaScript runtime for building the backend.
- **Express.js**: Web framework for creating RESTful APIs.
- **Prisma**: ORM for database management.
- **PostgreSQL**: Relational database for storing data.
- **OpenAI API**: For analyzing expenses and generating recommendations.
- **Docker**: For containerized deployment.
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
│       ├── server.ts           # Server entry point
│       ├── controllers/        # API controllers
│       ├── domain/             # Domain models and business logic
│       ├── infra/              # Infrastructure and integrations
│       ├── libs/               # Utility libraries
│       ├── middlewares/        # Express middlewares
│       ├── routes/             # API routes
│       └── types/              # TypeScript type definitions
└── client/                     # Placeholder for frontend (if applicable)
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

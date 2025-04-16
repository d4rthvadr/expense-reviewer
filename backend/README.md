# Expense Tracker Backend

This is the backend for the Expense Tracker application. It provides APIs to process and manage expense data, including integration with OpenAI's GPT models for text processing.

## Features

- **Text Processing**: Extracts and cleans data from receipt text into a structured JSON format.
- **OpenAI Integration**: Uses OpenAI's GPT models for advanced text processing.
- **RESTful API**: Provides endpoints for various operations.
- **Docker Support**: Includes a Dockerfile for containerized deployment.

## Prerequisites

- Node.js (v16 or later)
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
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   ```

## Usage

### Start the Server

Run the following command to start the server:

```bash
npm run start
```

The server will be available at `http://localhost:3000`.

### API Endpoints

#### POST `/process-text`

- **Description**: Processes receipt text and extracts structured data.
- **Request Body**:
  ```json
  {
    "text": "<receipt text>"
  }
  ```
- **Response**:
  ```json
  {
    "table": [
      { "name": "Item Name", "quantity": 1, "price": 10.00 },
      ...
    ]
  }
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

## Development

### Run in Development Mode

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

## License

This project is licensed under the MIT License.

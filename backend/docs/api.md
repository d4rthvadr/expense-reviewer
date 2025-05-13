## Entities

- **User**
- **Expense**
- **Category**
- **Expense-Category**: Allows an expense to belong to multiple categories.
- **Budget**: Tracks spending limits for categories or time periods.
- **Attachments**: Stores metadata for uploaded files associated with expenses.

## APis

### Create User

**Endpoint**:  
`POST /api/users`

**Request Body**:

```json
{
  "email": "string",
  "name": "string"
}
```

**Response**:

```json
{
  "message": "string" // Success message
}
```

**Example Request**:

```bash
curl -X POST https://your-api.com/api/user \
-H "Content-Type: application/json" \
-d '{
    "email": "john.doe@example.com",
    "name": "John Doe"
}'
```

**Example Response**:

```json
{
  "message": "User created successfully"
}
```

**Status Codes**:

- `201 Created`: User successfully created.
- `400 Bad Request`: Missing or invalid fields in the request body.
- `409 Conflict`: Email already exists.

### Notes:

- Ensure the `email` field is unique.
- Validation should be performed on the server to ensure the proper input

### Create expense

**Endpoint**:  
`POST /api/expenses`

**Request Body**:

```json
{
  "email": "string",
  "name": "string"
}
```

**Response**:

```json
{
  "message": "string" // Success message
}
```

**Example Response**:

```json
{
  "message": "User created successfully"
}
```

**Status Codes**:

- `201 Created`: User successfully created.
- `400 Bad Request`: Missing or invalid fields in the request body.
- `409 Conflict`: Email already exists.

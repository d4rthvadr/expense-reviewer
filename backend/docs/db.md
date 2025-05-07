Entities

- user
- expense
- category
- expense-category #Allow an expense to belong to multiple categories
- budget #Track spending limits for categories or time periods
- attachments #Store metadata for uploaded files associated with expenses

User

- id
- name ?
- email
- password
- created_at
- updated_at

Expense

- id
- name ? # Could be the current Month | Year
- description ?
- expense_type
- total amount # Total amount for all associated expense items (computed)
- created_at
- updated_at

Expense items

- id
- expense_id # Reference to the parent expense
- name
- quantity
- timestamp

Budget

- id
- user_id # Reference to the user
- amount # Budget limit
- start_date # Start of the budget period
- end_date # End of the budget period
- created_at
- updated_at

Attachments

- id
- expense_id
- user_id
- file_url # URL or path to the uploaded file
- file_type # MIME type of the file (e.g., image/png, application/pdf)
- file_size # Size of the file in bytes
- uploaded_at

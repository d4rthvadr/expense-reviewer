### Functional requirements

- A user should create expense with items
- A user should update / delete expense
- A user should view expense history
- A user should be able to add attachments to expenses
- A user should generate report at the end of a period

### Non-functional requirements

This is currently built for 2-10 users so simple backup strategy is fine.
Small amount of traffic so QPS, WPS and RPS provided by a simple server is sufficient.

- Should be highly available
- Should handle background jobs resiliently
- Should limit token usage for agentic calls to OpenAi.
- Should respond < 100ms of latency

### Out of scope

- RBAC
- Encryption at rest
- Sending emails with monthly/ duely reports
- Data replication or backup
- Rate-limiting
- CDN propagation

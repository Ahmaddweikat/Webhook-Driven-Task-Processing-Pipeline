# Webhook-Driven Task Processing Pipeline

A service that receives webhooks, processes them through a job queue, and delivers results to registered subscribers. Think of it as a simplified Zapier — an inbound event triggers a processing step, and the result is forwarded to one or more destinations.

## Key Features

### User Authentication
- **User Registration**: Allows new users to create accounts by providing necessary information.
- **User Login**: Enables registered users to log in securely and receive access and refresh tokens.
- **Token Refresh**: Users can obtain a new access token using their refresh token without logging in again.
- **Logout**: Invalidates all active tokens for the user.

### Pipeline Management (Admin Only)
- **Create Pipelines**: Admins can create pipelines with a processing action and subscriber URLs.
- **Read Pipelines**: Any logged-in user can view all available pipelines.
- **Update Pipelines**: Admins can update pipeline configuration, action type, and status.
- **Delete Pipelines**: Admins can delete pipelines along with their subscribers.

### Webhook Ingestion
- **Trigger Pipeline**: Users can trigger a pipeline by sending a payload to `POST /pipelines/:id/run`.
- **Async Processing**: Payloads are queued as jobs and processed in the background — never synchronously.

### Processing Actions
Seven different processing action types are supported:
- **field_filter**: Removes specified fields from the payload.
- **field_rename**: Renames keys based on a mapping configuration.
- **enrich**: Adds metadata such as timestamps, environment, and custom fields.
- **ai_summary**: Calls the Claude API to generate a human-readable summary of the payload.
- **conditional_filter**: Forwards the payload only if a condition is met, otherwise marks the run as failed.
- **template_transform**: Reshapes the payload using a template with `{{field}}` syntax.
- **http_enrich**: Calls an external API and merges the response into the payload.

### Background Worker
- Polls the database every 5 seconds for pending runs.
- Marks runs as `processing` before starting to prevent double-processing.
- Executes the pipeline's action and saves the output payload.
- Marks runs as `done` or `failed` based on the result.

### Result Delivery with Retry Logic
- Delivers the processed payload to all subscriber URLs via HTTP POST.
- Retries up to 3 times with exponential backoff (1s, 2s, 4s) on failure.
- Logs every delivery attempt in the database with status, HTTP status code, and error message.

### History API
- Users can view all their past pipeline runs.
- Each run shows the input payload, output payload, status, and timestamps.
- Users can view all delivery attempts for a specific run.

### API Documentation
- Full Swagger UI available at `GET /api-docs`.
- All endpoints documented with request bodies, parameters, and response schemas.
- Bearer token authentication supported directly in Swagger UI.

---

## Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get access + refresh tokens |
| POST | `/auth/refresh` | Get a new access token using refresh token |
| POST | `/auth/logout` | Logout and invalidate all tokens |

### Pipelines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pipelines` | Get all pipelines (any logged-in user) |
| POST | `/pipelines` | Create a new pipeline (admin only) |
| GET | `/pipelines/:id` | Get one pipeline with subscribers (any logged-in user) |
| PUT | `/pipelines/:id` | Update an existing pipeline (admin only) |
| DELETE | `/pipelines/:id` | Delete a pipeline (admin only) |
| POST | `/pipelines/:id/run` | Trigger a pipeline run (any logged-in user) |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/history` | Get all runs for the logged-in user |
| GET | `/history/:id` | Get one run by ID |
| GET | `/history/:id/deliveries` | Get all delivery attempts for a run |

---

## Architecture

```
src/
  api/          → route definitions
  controllers/  → request handlers
  services/     → business logic
  queries/      → database queries
  actions/      → processing action functions
  worker/       → background job processor
  middleware/   → auth and admin guards
  db/           → drizzle client and schema
  types/        → shared TypeScript interfaces
  config/       → environment variable management
  docs/         → swagger documentation
```

### Clean Separation of Concerns

```
routes → controllers → services → queries → database
                     ↘ actions (for worker only)
```

- **Routes**: Define URL mappings and apply middleware.
- **Controllers**: Handle HTTP request and response. No business logic.
- **Services**: Contain all business logic. No HTTP knowledge.
- **Queries**: All database operations. Nothing else.
- **Actions**: Pure functions — payload in, transformed payload out.

### Two Entry Points

```
src/server.ts        → starts the API server (Express)
src/worker/worker.ts → starts the background worker (polling loop)
```

Both share the same database but run as separate processes.

---

## Technology Stack

### Language and Framework
- **TypeScript**: Main programming language.
- **Express**: Framework for building the REST API.
- **Node.js**: Runtime environment.

### Database
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: Type-safe ORM for database queries and schema management.

### Authentication
- **JWT (JSON Web Tokens)**: For secure access token generation and verification.
- **bcrypt**: For secure password hashing.
- **Refresh Tokens**: Long-lived tokens stored in the database for obtaining new access tokens.

### API Documentation
- **Swagger UI**: Interactive API documentation at `/api-docs`.
- **OpenAPI 3.0**: Specification format for all endpoints.

### External Integrations
- **Anthropic Claude API**: Used by the `ai_summary` action to generate payload summaries.
- **HTTP Fetch**: Used by the `http_enrich` action to call external APIs.

---

## Design Decisions

### Why a separate worker process?
Webhook ingestion must return `202 Accepted` immediately without waiting for processing. Running the worker as a separate process ensures the API stays fast and responsive while heavy processing happens in the background.

### Why polling instead of a message queue?
For the scope of this project, polling the database every 5 seconds is simple, reliable, and requires no additional infrastructure. A message queue (like Redis or RabbitMQ) would be the next step for high-throughput production use.

### Why JWT + refresh tokens?
Access tokens expire in 15 minutes, limiting the window of exposure if a token is stolen. Refresh tokens (7 days) allow users to stay logged in without re-entering credentials. On logout, all tokens are invalidated in the database.

### Why admin-only pipeline management?
Pipelines define what processing happens and where results are delivered. Allowing any user to create pipelines would be a security risk. Admins configure pipelines, users trigger and use them.

### Why store tokens in the database?
Storing tokens in the database allows immediate invalidation on logout. A pure JWT approach would keep tokens valid until expiry even after logout.

---

## Setup Guide

### Prerequisites
- Node.js 18+
- PostgreSQL running locally or via Docker
- Anthropic API key (required only for `ai_summary` action)

### Step 1 — Clone the repository

```bash
git clone https://github.com/Ahmaddweikat/Webhook-Driven-Task-Processing-Pipeline.git
cd pipeline-service
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/pipeline_service
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
```

### Step 4 — Create the database

Connect to PostgreSQL and run:

```sql
CREATE DATABASE pipeline_service;
```

### Step 5 — Push the schema

```bash
npm run db:push
```

### Step 6 — Make yourself an admin

```sql
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
```

### Step 7 — Run the API and worker

Open two terminals:

```bash
# Terminal 1 — API server
npm run dev

# Terminal 2 — Background worker
npm run worker
```

The API will be accessible at `http://localhost:3000`.

The Swagger UI will be available at `http://localhost:3000/api-docs`.

---

## API Usage

### Register and Login

```bash
# Register
POST /auth/register
{
  "name": "Ali",
  "email": "ali@test.com",
  "password": "123456"
}

# Login
POST /auth/login
{
  "email": "ali@test.com",
  "password": "123456"
}
```

### Create a Pipeline (Admin)

```bash
POST /pipelines
Authorization: Bearer <accessToken>

{
  "name": "Filter Orders",
  "description": "Removes sensitive fields from order webhooks",
  "actionType": "field_filter",
  "actionConfig": { "remove": ["password", "card_number"] },
  "subscriberUrls": ["https://webhook.site/your-url"]
}
```

### Trigger a Pipeline (User)

```bash
POST /pipelines/:id/run
Authorization: Bearer <accessToken>

{
  "order_id": "123",
  "password": "secret",
  "amount": 99,
  "card_number": "4111111111111111"
}
```

Response:
```json
{
  "message": "Pipeline triggered successfully",
  "runId": "abc-123",
  "status": "pending"
}
```

### Check Run Status

```bash
GET /history/:runId
Authorization: Bearer <accessToken>
```

---

## Action Types Reference

| Action | Config Example | What it does |
|--------|---------------|--------------|
| `field_filter` | `{ "remove": ["password"] }` | Removes specified fields |
| `field_rename` | `{ "mapping": { "usr": "user" } }` | Renames keys |
| `enrich` | `{ "fields": { "source": "my-app" } }` | Adds metadata |
| `ai_summary` | `{}` | Adds Claude AI summary |
| `conditional_filter` | `{ "field": "amount", "operator": ">", "value": 100 }` | Filters by condition |
| `template_transform` | `{ "template": { "msg": "Hello {{name}}" } }` | Reshapes using template |
| `http_enrich` | `{ "url": "https://api.example.com/{{id}}", "method": "GET", "mergeKey": "info" }` | Merges external API response |

> **Note**: The `ai_summary` action requires a valid Anthropic API key with available credits.

---

## Run Status Flow

```
pending → processing → done
                    ↘ failed
```

| Status | Meaning |
|--------|---------|
| `pending` | Run created, waiting for worker to pick it up |
| `processing` | Worker is currently executing the action |
| `done` | Action completed and result delivered to subscribers |
| `failed` | Action or delivery failed — check `errorMessage` |

---

## Get Involved

### Ways to Contribute
- **Feedback**: Share your thoughts and ideas.
- **Issue Reporting**: Report bugs or issues on GitHub.
- **Code Contributions**: Contribute to the codebase.

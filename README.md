# WAULT

WAULT is an AI-powered digital legacy manager built as a monorepo with:

- `frontend/` React + Vite + Tailwind mobile-first app
- `backend/` Node.js + Express + Prisma API
- `ml-service/` Python FastAPI risk engine
- `blockchain/` Hardhat smart contract project

This repository is set up for:

- Local PostgreSQL on your machine
- Local Neo4j Desktop database
- Backblaze B2 for document storage
- Resend for email delivery
- Upstash Redis for caching and queues
- Polygon for blockchain audit logging

## 1. Prerequisites

Install these first:

- Node.js 20+ or 22+ recommended
- Python 3.10+
- PostgreSQL locally
- pgAdmin if you want a GUI for PostgreSQL
- Neo4j Desktop
- Git

Optional:

- Docker Desktop if you want to use `docker-compose.yml` instead of local PostgreSQL

## 2. Folder Overview

- `package.json`: root scripts for frontend/backend
- `.env.example`: master environment reference
- `backend/prisma/schema.prisma`: PostgreSQL schema
- `backend/src/config/neo4j.js`: Neo4j local connection
- `backend/src/services/b2.service.js`: Backblaze B2 storage
- `backend/src/services/resend.service.js`: Resend email integration
- `backend/src/config/redis.js`: Upstash cache + BullMQ queue config
- `ml-service/model.py`: synthetic-data model training script
- `ml-service/main.py`: FastAPI prediction service
- `blockchain/contracts/WaultLedger.sol`: on-chain audit contract

## 3. Environment Setup

Copy `.env.example` to `.env` at the repo root and replace every placeholder value.

Important variables:

- `DATABASE_URL`: local PostgreSQL connection string
- `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`: Neo4j Desktop connection
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `UPSTASH_REDIS_HOST`: Upstash REST and TCP values
- `B2_ACCOUNT_ID`, `B2_APPLICATION_KEY`, `B2_BUCKET_NAME`, `B2_BUCKET_ID`, `B2_ENDPOINT`: Backblaze B2 S3-compatible setup
- `RESEND_API_KEY`, `FROM_EMAIL`: Resend email setup
- `POLYGON_RPC_URL`, `PRIVATE_KEY`, `CONTRACT_ADDRESS`, `POLYGONSCAN_API_KEY`: blockchain setup
- `BACKEND_URL`: backend public base URL used in warning emails
- `FRONTEND_URL`: frontend app URL
- `ML_SERVICE_URL`: FastAPI risk engine URL
- `VITE_API_URL`: frontend API base URL, usually `http://localhost:3001/api`

## 4. Local PostgreSQL Setup

pgAdmin is only the GUI. You still need a running PostgreSQL server locally.

Recommended local setup:

1. Install PostgreSQL.
2. Create a database named `wault_db`.
3. Create a user named `wault_user`.
4. Set the password to match `.env`.
5. Grant privileges on `wault_db` to `wault_user`.
6. Update `DATABASE_URL` if your username, password, or port differ.

Example:

```env
DATABASE_URL=postgresql://wault_user:wault_pass@localhost:5432/wault_db
```

## 5. Local Neo4j Desktop Setup

1. Open Neo4j Desktop.
2. Create a local DBMS.
3. Set the password.
4. Start the database.
5. Use the Bolt URI shown by Neo4j Desktop, usually:

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password_here
```

## 6. Backblaze B2 Setup

WAULT uses Backblaze B2 with the S3-compatible endpoint.

Steps:

1. Create a B2 bucket.
2. Create an application key with bucket access.
3. Copy:
   - Account ID
   - Application key
   - Bucket name
   - Bucket ID
   - Endpoint
4. Place them in `.env`.

Example:

```env
B2_ACCOUNT_ID=...
B2_APPLICATION_KEY=...
B2_BUCKET_NAME=wault-files
B2_BUCKET_ID=...
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com
```

## 7. Resend Setup

1. Create a Resend account.
2. Verify your sending domain or use a permitted sender.
3. Copy the API key into:

```env
RESEND_API_KEY=re_xxx
FROM_EMAIL=WAULT <no-reply@yourdomain.com>
```

## 8. Upstash Redis Setup

WAULT uses Upstash for two things:

- REST API caching with `@upstash/redis`
- BullMQ queue processing using the TCP host

Add all three:

```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
UPSTASH_REDIS_HOST=...upstash.io
```

If Upstash is missing, the backend can still start, but queue workers are skipped.

## 9. Install Node Dependencies

From the repo root:

```powershell
npm install
```

For blockchain:

```powershell
cd blockchain
npm install
cd ..
```

This installs:

- Backend dependencies
- Frontend dependencies
- Blockchain dependencies

## 10. Python Virtual Environment and ML Requirements

The ML model is not trained from a CSV file right now.

Instead, `ml-service/model.py` generates 6000 synthetic training samples with these features:

- `login_count_30d`
- `days_inactive`
- `avg_response_delay`
- `prev_triggers`

This matches the project prompt and is meant as a bootstrap risk engine until you replace it with real historical data later.

Create and install the Python environment:

```powershell
cd ml-service
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Train the model:

```powershell
.\.venv\Scripts\python.exe model.py
```

This creates:

- `ml-service/model.pkl`
- `ml-service/label_map.pkl`

Run the ML API:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 11. Prisma Setup

From `backend/`:

```powershell
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
```

This will:

- Generate the Prisma client
- Create your local PostgreSQL schema
- Open Prisma Studio if needed

## 12. Blockchain Setup

WAULT stores only event hashes on-chain.
Sensitive data is not written to Polygon.

Before deploying:

1. Fund your wallet with test MATIC on Mumbai/Amoy-equivalent environment if you are using a testnet RPC.
2. Set:
   - `POLYGON_RPC_URL`
   - `PRIVATE_KEY`
   - `POLYGONSCAN_API_KEY`
3. Install blockchain packages:

```powershell
cd blockchain
npm install
```

Compile:

```powershell
npx hardhat compile
```

Test:

```powershell
npx hardhat test
```

Deploy:

```powershell
npx hardhat run scripts/deploy.js --network mumbai
```

After deploy:

1. Copy the contract address from the console.
2. Set `CONTRACT_ADDRESS=...` in `.env`.
3. Confirm `blockchain/deployments/mumbai/WaultLedger.json` exists.

## 13. Frontend Run

From the repo root:

```powershell
npm run dev
```

This runs:

- backend on `http://localhost:3001`
- frontend on `http://localhost:5173`

## 14. Backend Run

If you want backend only:

```powershell
cd backend
npm run dev
```

The backend expects:

- PostgreSQL reachable
- Neo4j reachable
- `.env` filled

Optional but recommended:

- Upstash configured for queues
- ML service running
- Backblaze configured for document uploads
- Resend configured for real emails

## 15. Readiness Checklist

Before full testing, make sure all of these are true:

- `.env` is filled with real keys
- PostgreSQL is running locally
- Neo4j Desktop database is running
- Prisma migration is applied
- Python venv exists and requirements are installed
- `model.pkl` is generated
- Upstash values are valid
- Backblaze B2 bucket and key are valid
- Resend key and sender are valid
- Blockchain contract is deployed and `CONTRACT_ADDRESS` is set

## 16. What Was Built

Frontend:

- Mobile-first React app
- Material UI icons
- Auth session restore
- Vault management
- Beneficiary management
- Guardian Protocol settings
- Beneficiary access page

Backend:

- Prisma PostgreSQL schema
- Neo4j integration
- JWT auth
- AES vault encryption
- Backblaze B2 integration
- Resend email integration
- Upstash cache + BullMQ worker wiring
- Risk scoring API
- Blockchain audit logging

ML:

- Synthetic training data generator
- RandomForest training script
- FastAPI prediction service

Blockchain:

- Hardhat project
- WaultLedger smart contract
- Deploy script
- Deployment artifact support

## 17. Current Limitations

- The ML model currently uses synthetic data, not a real CSV dataset.
- Full end-to-end runtime depends on real credentials and running local services.
- Blockchain deploy/test success depends on valid RPC, wallet key, and funded account.
- Email delivery requires a verified Resend sender.
- Document upload requires a valid B2 bucket and credentials.

## 18. Recommended First Run Order

1. Fill `.env`
2. Start PostgreSQL
3. Start Neo4j Desktop database
4. Install Node dependencies
5. Create Python venv and install requirements
6. Train the ML model
7. Run Prisma generate + migrate
8. Start backend
9. Start ML service
10. Start frontend
11. Compile and deploy blockchain contract
12. Add deployed `CONTRACT_ADDRESS`

"# Wault" 

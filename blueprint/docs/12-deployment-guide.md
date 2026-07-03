# 12. Deployment Guide


Project: MapleWealth, Personal Finance Dashboard
Owner: Master
Version: 1.0
Primary reference: Personal Financial Master Plan (Canada)
Core rule: Emergency Fund -> TFSA -> FHSA -> RRSP. Do not recommend trading, market timing, options, forex, meme stocks, or speculation.


## Deployment Target
Dockerized deployment on HomeCloud via Coolify.

## Services
- web: Next.js frontend
- api: NestJS backend
- postgres: database
- redis: cache/jobs
- minio: file storage
- worker: background jobs

## Environment Variables
- DATABASE_URL
- REDIS_URL
- AUTH_SECRET
- APP_URL
- S3_ENDPOINT
- S3_ACCESS_KEY
- S3_SECRET_KEY
- MARKET_DATA_API_KEY optional

## Release Flow
1. Push to GitHub
2. CI runs tests and lint
3. Build Docker images
4. Deploy through Coolify
5. Run Prisma migrations
6. Smoke test health endpoints

## Backup Rule
Daily PostgreSQL backup. Weekly restore test. Backups are useless until restore is tested.

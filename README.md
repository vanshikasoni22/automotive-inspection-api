# Automotive Inspection API

Backend API for the AI-Based Automotive Parts Return Inspection System.

## Tech Stack
- Node.js + Express
- PostgreSQL (Supabase)
- Cloudinary (image storage)
- JWT Authentication

## Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/inspections
- GET /api/inspections
- GET /api/inspections/:id

## Setup
1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in values
4. Run `npm run dev`
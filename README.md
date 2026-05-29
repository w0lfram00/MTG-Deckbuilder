# MTG-Deckbuilder
Custom deckbuilding and sharing platform for Magic: the Gathering

## Backend scaffold
This repository contains a minimal NestJS backend scaffold for the MTG Deckbuilder app.
It includes:
- Redis-backed caching for Scryfall searches
- Prisma/PostgreSQL deck and card persistence
- Jest test coverage for the search controller
- Prettier-friendly config via package scripts

## Setup
1. Install dependencies:

```bash
npm install
npm install --workspace backend
```

2. Copy `.env.example` to `backend/.env` and set your Postgres and Redis URLs.

3. Generate Prisma client and run migrations in `backend`:

```bash
cd backend
npx prisma generate
# Create a migration once your schema is final
npx prisma migrate dev --name init
```

4. Start the backend:

```bash
npm run start:backend
```

5. Test the search endpoint:

```bash
curl "http://localhost:3000/api/scryfall/search?q=lightning+bolt"
```

## Notes
- Redis is used as a temporary cache for Scryfall search results.
- Postgres is the authoritative storage for saved decks and card metadata.
- Use `npm run test:backend` for Jest tests.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Indexopia is a Next.js 15 cryptocurrency index tracking application that allows users to create and monitor custom crypto indices. The app uses a dual-database architecture with PostgreSQL (Prisma) for authentication and MySQL for crypto asset data.

## Core Technology Stack

- **Framework**: Next.js 15 (App Router) with React 19
- **UI**: shadcn/ui components + TailwindCSS
- **Authentication**: NextAuth v5 with Prisma adapter + Resend email provider
- **Database**:
  - PostgreSQL (Prisma) for auth/user data
  - MySQL for crypto assets, history, and indices
- **Internationalization**: next-intl with support for en, uk, ru locales
- **State Management**: React Server Components + Server Actions + SWR for client-side caching
- **Styling**: TailwindCSS with custom variants

## Development Commands

### Environment Setup

```bash
# Install dependencies
yarn install

# Set up Prisma auth database (creates tables, runs migrations)
yarn prisma:env

# Access Prisma database via tunnel (for DBeaver/other clients)
yarn prisma:tunnel

# Connect to MySQL crypto database
yarn mysql:connect
```

### Development

```bash
# Run development server (with Turbopack)
yarn dev

# Run development with production env variables
yarn dev:prd

# Run with Node inspector for debugging
yarn inspect
```

### Build & Deploy

```bash
# Build for production
yarn build

# Start production server (default port 3000)
yarn start

# Start on custom port 3001
yarn start:local

# Build and start locally
yarn b:s
```

### Code Quality

```bash
# Run ESLint
yarn lint

# Format code with Prettier
yarn format
```

## Database Architecture

### Dual Database System

The application uses two separate databases:

1. **PostgreSQL (Prisma)**: Authentication, users, sessions, verification tokens
   - Schema: `prisma/schema.prisma`
   - Client: `src/lib/prisma`
   - Access credentials: `DATABASE_URL` env variable

2. **MySQL**: Crypto assets, asset history, indices, index overviews
   - Accessed via server-side helpers in `src/lib/db/helpers/`
   - Data also persisted as JSON files in `/db/` folders for caching/backup
   - Access credentials: `MYSQL_*` env variables

### MySQL Data Model

Key entities stored in MySQL:
- **Assets**: Cryptocurrency metadata (id, name, symbol, market_cap, etc.)
- **AssetHistory**: Daily historical price data per asset
- **IndexOverview**: User-created indices with asset allocations and portions
- **IndexHistory**: Calculated historical performance of indices

### JSON File System

The `/db/` directory serves as a hybrid cache/backup system:
- `db/assets/`: Asset snapshots with timestamps
- `db/indexes/`: Index configuration files (by UUID)
- `db/assets_history/`, `db/populated-history/`: Historical data
- Files are written alongside database operations for resilience

## Application Architecture

### Route Structure

```
src/app/
├── [locale]/                    # Internationalized routes
│   ├── indices/                 # Main index listing page
│   │   ├── [id]/               # Individual index detail page
│   │   └── components/CLAUD_WEB/  # Page-specific components
│   ├── auth/                    # Auth pages (signin, verify-request, error)
│   ├── dev-auth/               # Development auth bypass
│   └── legal/                   # Privacy & terms pages
├── api/
│   ├── cron/                   # Scheduled jobs endpoint (QStash)
│   ├── populate/               # Data population endpoints
│   │   ├── route.ts           # Main populate (assets + history + indices)
│   │   └── indices/           # Populate system indices only
│   ├── assets/                 # Asset CRUD
│   ├── assets-history/         # Asset history CRUD
│   ├── indices/                # Index CRUD
│   ├── backoffice/            # Admin operations
│   └── auth/                   # NextAuth endpoints
├── actions/                    # Server actions
└── components/                 # Shared components
```

### Key Server Actions Pattern

Server actions are located in `actions.ts` files at each route level:
- `src/app/[locale]/indices/actions.ts`: Index list actions
- `src/app/[locale]/indices/[id]/actions.ts`: Single index actions
- `src/app/actions/`: Global actions (e.g., asset fetching)

### Data Flow for Indices

1. **Population** (Cron/Manual):
   - `api/populate` → Fetches top assets from external API
   - `manageAssets()` → Writes to MySQL + JSON files
   - `manageAssetHistory()` → Fetches historical data for each asset
   - `manageSystemIndices()` → Creates/updates built-in indices

2. **Index Calculation**:
   - User creates index with asset allocations (portions must sum to 100%)
   - `getIndexHistoryOverviewByAssetsOverview()` → Calculates weighted performance
   - Index history is normalized based on starting balance
   - Performance calculated for 1d, 7d, 30d, and total (since creation)

3. **Client Display**:
   - Server components fetch data via `actions.ts`
   - Client components (`CLAUD_WEB/*`) use SWR for client-side fetching
   - Charts use Recharts library

## Critical Constants & Configuration

### Path Aliases (tsconfig.json)

- `@/*` → `src/*`
- `@/auth` → Root `auth.ts`
- `@/prisma` → `src/lib/prisma`
- `@ui` → `src/components/ui/*`
- `@custom-ui` → `src/components/custom-ui/*`
- `@constants` → `src/utils/constants/*`
- `@helpers` → `src/utils/helpers/*`
- `@types` → `src/utils/types/*`
- `@numeral` → `src/utils/numeral`

### Important Constants (src/utils/constants/general.constants.ts)

- `MAX_ASSETS_COUNT_FOR_SYSTEM_INDICES`: 50 (for built-in indices)
- `MAX_ASSETS_COUNT`: 500 (total DB limit)
- `MAX_ASSET_PORTION`: 50 (max % of index in single asset)
- `OMIT_ASSETS_IDS`: Stablecoins excluded from indices
- `SUPPORTED_LOCALES`: ["en", "uk", "ru"]
- `HISTORY_OVERVIEW_DAYS`: 30 (days to calculate overview)

## Environment Variables

Required environment variables (see `.env.local` for template):

**Prisma/Auth:**
- `DATABASE_URL`: PostgreSQL connection string (from Prisma Console)
- `AUTH_SECRET`: NextAuth secret
- `AUTH_RESEND_KEY`: Resend API key for email verification

**MySQL:**
- `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`

**API Keys:**
- `API_KEY`: Protection for populate endpoints
- `CRON_SECRET`: Authorization for cron jobs

**External Services:**
- `RECAPTCHA_SECRET_KEY`: Google reCAPTCHA

## Data Population System

### QStash Cron Job Setup

Scheduled jobs run via Upstash QStash:
- **Endpoint**: `api/cron` (requires `CRON_SECRET` bearer token)
- **Purpose**: Daily updates of asset prices and index calculations
- **Flow**: Calls `populateDb()` → `manageAssets()` → `manageAssetHistory()` → `manageSystemIndices()`

### Manual Population

```bash
# Populate all data (requires API_KEY)
GET/POST /api/populate?apiKey=<API_KEY>&start=0&end=500

# Populate only system indices
GET/POST /api/populate/indices?apiKey=<API_KEY>
```

## Authentication Flow

1. User enters email on `/auth/signin`
2. Resend sends verification email with locale-specific template
3. Email link verified via NextAuth
4. Session stored in PostgreSQL, accessible via `auth()` helper
5. Role-based access: `user` | `globalAdmin`

## Testing & Debugging

### Database Inspection

**Prisma (PostgreSQL):**
```bash
yarn prisma:tunnel  # Then connect via DBeaver on port 7777
```

**MySQL:**
```bash
yarn mysql:connect  # Interactive shell
```

### Dev Auth Bypass

Navigate to `/dev-auth` in development to bypass email verification (controlled by `DEV_AUTH_PATH` constant).

## Performance Optimizations

- **Next.js caching**: Uses `unstable_cache` with custom tags (see `src/utils/cache/`)
- **Revalidation**: Manual via `revalidateTag` and `revalidatePath` API endpoints
- **Component caching**: Experimental `cacheComponents: true` in next.config.ts
- **Compression**: Enabled in production builds

## Common Workflows

### Adding a New Index Feature

1. Update MySQL schema/queries in `src/lib/db/helpers/db.indexOverview.helpers.ts`
2. Add server action to `src/app/[locale]/indices/[id]/actions.ts`
3. Update client component in `src/app/[locale]/indices/[id]/components/CLAUD_WEB/`
4. Add any new types to `src/utils/types/general.types.ts`
5. Update cache tags if needed in `src/utils/cache/`

### Modifying Asset Data Structure

1. Update `Asset` type in `src/utils/types/general.types.ts`
2. Modify `db.assets.helpers.ts` and related DB helpers
3. Update population logic in `src/app/api/api.helpers.ts`
4. Verify JSON file serialization in `db/assets/`

### Adding Internationalization

1. Add translations to `messages/<locale>.json`
2. Use `useTranslations()` in client components
3. Use `getTranslations()` in server components/actions
4. Fallback chain: requested locale → default locale (en)

## Important Notes

- **Asset portions must sum to 100%**: Enforced in `getIndexHistoryOverviewByAssetsOverview()`
- **History calculation**: Based on start of day (UTC) using moment-timezone
- **Asset filtering**: Excludes stablecoins via `OMIT_ASSETS_IDS`
- **UUID generation**: Uses `uuid` library via `generateUuid()` helper
- **Date handling**: Always use `moment-timezone` with UTC for consistency
- **Component naming**: `CLAUD_WEB/` folders contain page-specific client components (legacy naming convention)

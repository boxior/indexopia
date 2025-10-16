# Create DBs

```sql
CREATE TABLE assets (
    id VARCHAR(50) NOT NULL PRIMARY KEY,      -- Primary key, shorter max length
    rank VARCHAR(50) NOT NULL,   
    symbol VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    supply DECIMAL(20, 8) NOT NULL,
    maxSupply DECIMAL(20, 8),
    marketCapUsd DECIMAL(20, 8) NOT NULL,
    volumeUsd24Hr DECIMAL(20, 8) ,
    priceUsd DECIMAL(20, 8) NOT NULL,
    changePercent24Hr DECIMAL(20, 8) NOT NULL,
    vwap24Hr DECIMAL(20, 8),
    explorer VARCHAR(255)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```


```sql
CREATE TABLE index_overview (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, -- Auto-incremented primary key
    name VARCHAR(255) NOT NULL, -- Corresponds to the name field of Index
    historyOverview JSON NOT NULL, -- Storing JSON data for historyOverview object structure
    maxDrawDown JSON NOT NULL, -- Storing JSON data for maxDrawDown object structure
    assets JSON NOT NULL, -- Storing the assets array as JSON
    startTime BIGINT, -- Corresponds to the optional startTime field of Index
    endTime BIGINT, -- Corresponds to the optional endTime field of Index
    isSystem BOOLEAN, -- Corresponds to the optional isSystem field of Index
    systemId VARCHAR(255), -- Optional systemId field for querying by system
    userId VARCHAR(255), -- Optional userId field for querying by user
    PRIMARY KEY (id) -- Setting id as the primary key
);
```

## Add column to assets_history table:
```sql
ALTER TABLE yulya777_indexopia.assets_history ADD clonedFrom varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL;
```

/**
 * To create Assets View sorted by Rank Asc
 */
// CREATE OR REPLACE VIEW assets_sorted AS
// SELECT *
// FROM assets
// ORDER BY CAST(rank AS UNSIGNED) ASC;

/**
 * To create Assets History View sorted by Time Asc
 */
// CREATE OR REPLACE VIEW assets_history_sorted AS
// SELECT
// assetId,
//     priceUsd,
//     time,
//     date
// FROM
// assets_history
// ORDER BY
// time ASC;

/**
 * Drop View
 */
// DROP VIEW IF EXISTS assets_sorted;

/**
 * Clear table
 */
// TRUNCATE TABLE assets;
 * Show Transactions
 // SHOW PROCESSLIST;

## Prisma + Postgres

### Connect via dBeaver
- `yarn prisma:tunnel`
- switch off ssl on dBeaver
- specify the port on dBeaver
- [Docs](https://www.prisma.io/docs/postgres/database/tooling#connecting-to-prisma-postgres-instance-with-3rd-party-database-editors)


### Allow Prisma Session to be deleted:
```sql
ALTER TABLE "Session" REPLICA IDENTITY FULL;
```
### Get not at time 00:00:00.000Z records:
```sql
SELECT ah.* FROM yulya777_indexopia.assets_history AS ah
WHERE date NOT LIKE '%T00:00:00.000Z';
```
### Normalize not at time 00:00:00.000Z records:
```sql
    UPDATE yulya777_indexopia.assets_history
SET 
    date = DATE_FORMAT(DATE(SUBSTRING(date, 1, 10)), '%Y-%m-%dT00:00:00.000Z'),
    time = UNIX_TIMESTAMP(DATE(SUBSTRING(date, 1, 10))) * 1000
WHERE date NOT LIKE '%T00:00:00.000Z'
```
### Update Postgres user
```sql
UPDATE "User" 
SET role = 'globalAdmin' 
WHERE email = 'irinfo@ukr.net';
```

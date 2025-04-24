# Create DBs

## Custom Index
```sql
CREATE TABLE custom_index (
id VARCHAR(255) NOT NULL PRIMARY KEY, -- Represents the 'id' field
name VARCHAR(255) NOT NULL,          -- Represents the 'name' field
startTime BIGINT,                    -- Represents the optional 'startTime' field
isDefault BOOLEAN DEFAULT FALSE      -- Represents the optional 'isDefault' field
);
```

```sql
CREATE TABLE custom_index_assets (
    id VARCHAR(255) NOT NULL,            -- Represents the asset 'id' field
    customIndexId VARCHAR(255) NOT NULL, -- Foreign key to custom_index
    portion FLOAT NOT NULL,              -- Represents the 'portion' field
    PRIMARY KEY (id, customIndexId),     -- Composite primary key (one asset per custom index)
    FOREIGN KEY (customIndexId) REFERENCES custom_index(id) ON DELETE CASCADE
);

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

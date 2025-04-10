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

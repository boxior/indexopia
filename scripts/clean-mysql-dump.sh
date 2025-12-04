#!/bin/bash

# Clean MySQL dump for Aiven/managed cloud databases
# Usage: ./clean-mysql-dump.sh input.sql [output.sql]

if [ -z "$1" ]; then
    echo "Usage: $0 input.sql [output.sql]"
    echo "Example: $0 dump.sql dump-clean.sql"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="${2:-${INPUT_FILE%.sql}-final.sql}"

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found"
    exit 1
fi

echo "Cleaning MySQL dump: $INPUT_FILE"
echo "Output file: $OUTPUT_FILE"

# Create header
cat > "$OUTPUT_FILE" << 'HEADER'
-- Disable primary key requirement for Aiven MySQL
SET SESSION sql_require_primary_key = 0;

HEADER

# Remove problematic statements and append
sed -E '/SET @MYSQLDUMP_TEMP_LOG_BIN|SET @@SESSION.SQL_LOG_BIN|SET @@GLOBAL.GTID_PURGED/d' "$INPUT_FILE" >> "$OUTPUT_FILE"

# Add footer
cat >> "$OUTPUT_FILE" << 'FOOTER'

-- Re-enable primary key requirement
SET SESSION sql_require_primary_key = 1;
FOOTER

echo "✅ Done! Cleaned dump saved to: $OUTPUT_FILE"
echo ""
echo "To restore:"
echo "  mysql -u user -h host -P port --password database < $OUTPUT_FILE"

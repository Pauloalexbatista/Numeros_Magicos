#!/bin/sh
set -e

echo "🚀 Starting Números Mágicos Entrypoint..."

# Detect if we should use PostgreSQL based on DATABASE_URL
# This matches the logic in vercel-build.js and prisma.ts
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ DATABASE_URL not set. Falling back to SQLite if possible."
else
    # Check if DATABASE_URL starts with postgres/postgresql
    case "$DATABASE_URL" in
        postgres*|postgresql*)
            echo "🐘 PostgreSQL detected. Ensuring schema is up to date..."
            # We use db push for simplicity in this project as it doesn't use migrations folders
            npx prisma@5.22.0 db push --accept-data-loss
            echo "✅ Database schema synchronized."
            ;;
        *)
            echo "📦 SQLite detected (or other). Skipping Postgres-specific sync."
            ;;
    esac
fi

# Run the provided command (usually node server.js)
echo "🎬 Starting application..."
exec "$@"

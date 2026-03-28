#!/bin/sh
set -e

# Support shadowing fix path
cd "/app/database-engine"

echo "🚀 Starting Números Mágicos Entrypoint..."

# Wait for DB to be ready script
wait_for_db() {
    if [ -n "$DATABASE_URL" ]; then
        case "$DATABASE_URL" in
            postgres*|postgresql*)
                echo "⏳ Waiting for PostgreSQL to be ready..."
                # Extract host and port from DATABASE_URL
                # URL format: postgresql://user:pass@host:port/db
                DB_HOST=$(echo $DATABASE_URL | sed -e 's|.*@||' -e 's|/.*||' -e 's|:.*||')
                DB_PORT=$(echo $DATABASE_URL | sed -e 's|.*:||' -e 's|/.*||')
                
                # If port is not numeric, default to 5432
                if ! [ "$DB_PORT" -eq "$DB_PORT" ] 2>/dev/null; then
                  DB_PORT=5432
                fi

                echo "🔍 Checking connection to $DB_HOST:$DB_PORT..."
                
                MAX_TRIES=30
                COUNT=0
                while ! nc -z $DB_HOST $DB_PORT; do
                    COUNT=$((COUNT + 1))
                    if [ $COUNT -gt $MAX_TRIES ]; then
                        echo "❌ Error: Database not reachable after $MAX_TRIES attempts."
                        # We don't exit here to allow next commands to fail with better errors
                        break
                    fi
                    echo "😴 DB not ready ($COUNT/$MAX_TRIES). Sleeping 2s..."
                    sleep 2
                done
                echo "✅ DB is reachable!"
                ;;
        esac
    fi
}

# Run wait logic
wait_for_db

# Detect if we should use PostgreSQL based on DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ DATABASE_URL not set. Falling back to SQLite if possible."
else
    case "$DATABASE_URL" in
        postgres*|postgresql*)
            echo "🐘 PostgreSQL detected. Ensuring schema is up to date..."
            # Try to push schema but don't crash the whole entrypoint if it fails during a transition
            if npx prisma@5.22.0 db push --accept-data-loss; then
                echo "✅ Database schema synchronized."
            else
                echo "⚠️ WARNING: Database synchronization failed. Check your connection URL."
                # Don't exit - let the app try to start, it might have a valid client already
            fi
            ;;
        *)
            echo "📦 SQLite detected (or other). Skipping Postgres-specific sync."
            ;;
    esac
fi

# Run the provided command (usually node server.js)
echo "🎬 Starting application..."
exec "$@"

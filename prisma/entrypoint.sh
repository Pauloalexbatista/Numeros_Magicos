#!/bin/sh
set -e

# Perform DB operations and then return to root
echo "📂 Entering database-engine directory..."
cd "/app/database-engine" || { echo "❌ Failed to enter database-engine"; exit 1; }

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

                echo "🔍 Checking connection to $DB_HOST:$DB_PORT (Internal Host Check)..."
                
                MAX_TRIES=30
                COUNT=0
                while ! nc -zv $DB_HOST $DB_PORT; do
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
            # Use npx with local prisma for maximum compatibility, falling back to direct binary path
            # Specifying the postgresql schema to ensure correct binary targets and provider
            if npx prisma db push --schema=schema.postgresql.prisma --accept-data-loss; then
                echo "✅ Database schema synchronized."
            elif [ -f "./node_modules/.bin/prisma" ] && ./node_modules/.bin/prisma db push --schema=schema.postgresql.prisma --accept-data-loss; then
                echo "✅ Database schema synchronized (via direct binary)."
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

# IMPORTANT: Return to THE APP ROOT before starting the server
# Standalone Next.js expects server.js to be in current working directory /app
cd "/app"
echo "🏘️ Current directory: $(pwd)"

# Only verify server.js exists when running the Next.js web server
# The cron container runs a different command (npx tsx smart-cron.ts)
if [ "$1" = "node" ] && [ "$2" = "server.js" ]; then
    ls -F server.js || { echo "❌ server.js not found!"; exit 1; }
fi

# Run the provided command (node server.js for web, npx tsx ... for cron)
echo "🎬 Starting: $@"
exec "$@"

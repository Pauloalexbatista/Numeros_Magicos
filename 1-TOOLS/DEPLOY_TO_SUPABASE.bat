@echo off
chcp 65001 >nul
echo ===================================================
echo 🚀 DEPLOYMENT: Enviar Base de Dados para Supabase
echo ===================================================
echo.
echo Este script vai:
echo 1. Gerar o Cliente Prisma para PostgreSQL
echo 2. Criar as tabelas na Supabase 
echo 3. Enviar os dados locais (1900+ sorteios) para a nuvem
echo 4. Restaurar o teu ambiente local para SQLite
echo.

:: Ensure we are in the project root (one level up from tools)
cd /d "%~dp0.."

set /p DB_PASS="🔑 Digite a Password da Base de Dados (tua password do Supabase): "
echo.

:: Construct the connection string using the Project ID from the screenshot
:: Using the "Pooler" connection (Port 6543) because User is on IPv4
set DATABASE_URL=postgresql://postgres.piqzcnggsdugbtfkqypy:%DB_PASS%@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
set DIRECT_URL=postgresql://postgres.piqzcnggsdugbtfkqypy:%DB_PASS%@aws-1-eu-west-2.pooler.supabase.com:6543/postgres

echo 🔄 [1/4] A configurar Prisma para PostgreSQL...
call npx prisma generate --schema=prisma/schema.postgresql.prisma

echo ⚠️ [2/4] Abertura do ficheiro SQL para criação de tabelas...
echo Devido a limitações de rede (IPv4), não é possível criar tabelas automaticamente.
echo O ficheiro 'prisma/schema.sql' vai abrir.
echo 1. Copia TODO o conteúdo desse ficheiro.
echo 2. Cola no "SQL Editor" do Supabase e clica RUN.
echo.
start notepad prisma/schema.sql
pause

echo 🌱 [3/4] A enviar dados (isto pode demorar 1-2 minutos)...
call npx tsx src/scripts/database/seed-production.ts

echo 🔙 [4/4] A restaurar ambiente local...
call npx prisma generate --schema=prisma/schema.prisma

echo.
echo ===================================================
echo ✅ SUCESSO! A Base de Dados está online.
echo.
echo Agora podes configurar o projeto na Vercel com as variáveis:
echo DATABASE_URL=%DATABASE_URL%
echo.
pause

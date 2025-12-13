import pandas as pd
import sqlite3
import json
from datetime import datetime

print('📥 IMPORTANDO SORTEIOS DO EXCEL...\n')

# Read Excel
df = pd.read_excel('tools/BD com todos os sorteios.xlsx')
print(f'📊 Encontrados {len(df)} sorteios no Excel')
print(f'📋 Colunas: {list(df.columns)}\n')

# Connect to database
conn = sqlite3.connect('prisma/dev.db')
cursor = conn.cursor()

# Import each row
imported = 0
for index, row in df.iterrows():
    try:
        # Parse date
        date_str = str(row['Date']) if 'Date' in row else str(row.iloc[1])
        draw_date = pd.to_datetime(date_str).strftime('%Y-%m-%d %H:%M:%S')
        
        # Parse numbers (columns N1-N5)
        numbers = [int(row[f'N{i}']) for i in range(1, 6)]
        
        # Parse stars (columns E1-E2)
        stars = [int(row[f'E{i}']) for i in range(1, 3)]
        
        # Insert into database
        cursor.execute('''
            INSERT OR REPLACE INTO Draw (date, numbers, stars, jackpot, hasWinner)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            draw_date,
            json.dumps(numbers),
            json.dumps(stars),
            0,  # jackpot (not in Excel)
            False  # hasWinner (not in Excel)
        ))
        
        imported += 1
        if imported % 100 == 0:
            print(f'   Importados {imported}/{len(df)}...')
            conn.commit()
            
    except Exception as e:
        print(f'❌ Erro na linha {index}: {e}')
        print(f'   Dados: {row.to_dict()}')
        break

conn.commit()
conn.close()

print(f'\n✅ IMPORTAÇÃO COMPLETA: {imported} sorteios')

# Verify
conn = sqlite3.connect('prisma/dev.db')
cursor = conn.cursor()
count = cursor.execute('SELECT COUNT(*) FROM Draw').fetchone()[0]
print(f'📊 Total na BD: {count}')

# Show first draw
first = cursor.execute('SELECT * FROM Draw ORDER BY date ASC LIMIT 1').fetchone()
if first:
    print(f'\n📊 PRIMEIRO SORTEIO:')
    print(f'   Data: {first[1]}')
    print(f'   Números: {first[2]}')
    print(f'   Estrelas: {first[3]}')

conn.close()

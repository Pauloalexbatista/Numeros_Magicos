# Database Export/Import Guide

## Workflow para Produção

### 1. Desenvolvimento Local (PC)

#### Atualizar Sistemas Normais (1x/mês)
```bash
# Executar localmente
.\tools\ATUALIZACAO_FLASH.bat
```

#### Treinar Sistemas Neuronais (1x/semana)
```bash
# Executar localmente
.\tools\ML_UPDATE.bat
```

### 2. Exportar Base de Dados
```bash
# Criar cópia para produção
.\tools\EXPORT_DB.bat
```

Isto cria:
- `export/production.db` - Para upload
- `export/backup_YYYYMMDD_HHMM.db` - Backup local

### 3. Upload para Produção

#### Opção A: Via FTP/SFTP
```bash
# Exemplo com scp
scp export/production.db user@servidor:/app/prisma/dev.db
```

#### Opção B: Via Painel de Controlo
1. Aceder ao painel do hosting
2. Fazer upload de `export/production.db`
3. Substituir ficheiro `prisma/dev.db`

#### Opção C: Via Git (se BD for pequena)
```bash
git add export/production.db
git commit -m "Update: Latest predictions and rankings"
git push
```

### 4. Reiniciar Servidor (se necessário)
```bash
# Exemplo Docker
docker restart numeros-magicos-app

# Ou via painel de controlo
```

---

## Frequência Recomendada

| Tarefa | Frequência | Tempo Estimado |
|--------|-----------|----------------|
| Atualizar Sorteios | Após cada sorteio | 1 min |
| Flash Update (Sistemas Normais) | 1x/mês | 5-10 min |
| ML Update (Neuronais) | 1x/semana | 1-2 min |
| Upload para Produção | Após updates | 2-5 min |

---

## Vantagens desta Abordagem

✅ **Sem timeout**: Processos longos correm no PC  
✅ **Sem custos**: Não precisa de servidor potente  
✅ **Controlo total**: Vê progresso em tempo real  
✅ **Backups automáticos**: Cada export cria backup  
✅ **Flexibilidade**: Atualiza quando quiser  

---

## Notas Importantes

⚠️ **Backup**: Sempre fazer backup da BD de produção antes de substituir  
⚠️ **Tamanho**: Verificar tamanho da BD antes de upload (limite do hosting)  
⚠️ **Downtime**: Pode haver 1-2 segundos de indisponibilidade durante substituição  

---

**Última atualização**: 2025-12-13

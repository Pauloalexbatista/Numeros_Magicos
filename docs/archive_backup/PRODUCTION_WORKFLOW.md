# 📖 PRODUCTION WORKFLOW - Números Mágicos

> **Última atualização:** 16 Mar 2026  
> **Arquitetura:** Aplicação Monolítica (Next.js + SQLite + Python ML) alojada em Hostinger VPS.

---

## 🎯 A Nova Arquitetura Monolítica

A aplicação agora reside de forma autónoma num servidor **Hostinger VPS**. A base de dados (`dev.db` - SQLite) vive diretamente no servidor, montada no *volume* do Docker.

*   Não existe sincronização com a Vercel Postgres.
*   O servidor possui um container interno *Cron Job* (`numeros-magicos-cron`) que executa comandos de atualização e de recalculo de ML de forma autónoma de hora a hora.
*   A base de dados de Produção é a que está no Hostinger. A base de dados no PC Local serve apenas para testes e desenvolvimento.

---

## 🔄 Como Aplicar Alterações (O Workflow)

Sempre que existirem alterações no código, design, ou a criação de novos sistemas matemáticos, o processo é o seguinte:

### Passo 1: Desenvolvimento Local
O código é editado e os testes são efetuados na máquina local.

### Passo 2: Enviar Código para o Repositório
Qualquer alteração validada localmente é comitada e enviada para o GitHub:
```bash
git add .
git commit -m "A minha alteração"
git push
```

### Passo 3: Deploy na Produção (Hostinger)
De forma a que o servidor atualize com o código novo, é necessário processar um deploy (através de um sistema como Coolify ou manualmente via SSH na VPS):
```bash
# Se o deploy for manual na VPS:
cd ~/projects/numeros-magicos
git pull
docker compose -f docker-compose.prod.yml up -d --build
```
> Após o Docker reiniciar, o site e o cron job estarão a correr as novas versões do software e dos algoritmos de IA.

---

## 🛠️ Operações de Emergência e Manutenção da BD

Como a base de dados reside no Hostinger debaixo de um sistema Docker fechado, a manutenção direta (ex: apagar sorteios errados ou forçar recálculos manuais massivos) deve ser feita:

1. **Via Endpoints Admin Ocultos:** Construindo uma rota de API segura no código (ex: `/api/admin/fix-algo`), fazendo o deploy, e executando-a remotamente.
2. **Via Consola SSH (Avançado):** Entrando pelo terminal diretamente na VPS do Hostinger, acedendo ao contentor Docker e executando os scripts do Prisma/Node.

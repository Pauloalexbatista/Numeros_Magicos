# 🛡️ Relatório de Recuperação - Infraestrutura Números Mágicos (Abril 2026)

Este documento serve como guia de referência para todas as alterações efetuadas para restaurar a conectividade da base de dados e o site público.

## 1. Acesso Administrativo (Coolify)
- **Problema:** Password de admin esquecida e sistema de recuperação inativo.
- **Solução:** Reset manual via base de dados interna do Coolify (`sqlite3`).
- **Credenciais Atuais:** `pauloalexbatista@gmail.com` | `Coolify2026!`

## 2. Base de Dados PostgreSQL
- **Configuração:** Mapeada para a porta exterior **5432** para permitir acesso local.
- **Utilizador:** `admin_magico`
- **Base de Dados:** `numeros_magicos_prod`
- **IP Interno:** `172.16.16.2` (Usar este valor no `DATABASE_URL` da aplicação no Coolify para estabilidade).

## 3. Configuração de Rede e Firewall
As seguintes portas foram abertas na firewall da Hostinger:
- **SSH:** 22
- **WEB:** 80 (HTTP) e 443 (HTTPS)
- **DATABASE:** 5432 (PostgreSQL)

## 4. Aplicação Next.js (Destaques Técnicos)
- **Prisma Client:** Reconfigurado para usar o provider `postgresql` em vez de `sqlite`. Caso o erro `P3019` volte a aparecer, apagar a pasta `migrations` e forçar o `npx prisma db push`.
- **Protocolo Interno:** Desativado o **"Internal HTTP/2"** no painel do Coolify. O Next.jsStandalone espera HTTP simples na porta 3000.
- **Variáveis de Ambiente Críticas:**
  - `NEXTAUTH_URL`: Deve apontar para `https://www.numerosmagicos.com` em produção.
  - `AUTH_TRUST_HOST`: `true`
  - `DATABASE_URL`: Deve usar o IP interno `172.16.16.2` para evitar falhas de resolução de nome.

## 5. Próximos Passos (Agendados)
- Atualização de dados históricos (sorteios recentes).
- Verificação de CronJobs de atualização automática.

---
**Data da Intervenção:** 16-17 de Abril de 2026
**Responsável Técnico:** Antigravity (IA Coding Assistant)

# Guia de Deploy - Hostinger VPS (KVM 2)

Este guia explica como colocar o site a funcionar na tua nova VPS.

## 1. Preparação na VPS (Terminal)

Entra na tua VPS via SSH e cria a pasta do projeto:

```bash
mkdir -p ~/projects/numeros-magicos
cd ~/projects/numeros-magicos
```

## 2. Enviar o Código

Podes usar o Git ou simplesmente copiar os ficheiros. O mais simples é usares o Git se tiveres o código no GitHub.

## 3. Configuração (.env)

Cria o ficheiro `.env` na VPS com os teus segredos:

```bash
nano .env
```

Copia e ajusta:

```env
AUTH_SECRET="uma-chave-aleatoria-longa"
NEXTAUTH_SECRET="outra-chave-aleatoria-longa"
CRON_SECRET="chave-para-api-cron"
```

## 4. Lançar o Site

Usa este comando para construir e lançar tudo:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 💡 Notas Importantes

### O que acontece agora?

1. **Site Online**: O teu site estará acessível no domínio que configuraste no Traefik (ou no IP da VPS).
2. **Atualização Automática**: Existe um segundo "mini-container" (o `cron`) que corre a cada hora. Ele verifica se há novos sorteios no EuroMilhões, EuroDreams e Totoloto. Se houver, ele atualiza a base de dados instantaneamente.
3. **Persistência**: A base de dados SQLite está guardada na pasta `prisma/` da tua VPS. Se reiniciares o servidor, os dados não se perdem.

### Como ver se está tudo bem?

Para ver os logs do sistema de atualização:

```bash
docker logs -f numeros-magicos-cron
```

Para ver os logs do site:

```bash
docker logs -f numeros-magicos-prod
```

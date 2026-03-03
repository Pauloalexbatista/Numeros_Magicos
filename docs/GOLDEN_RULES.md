# 🌟 GOLDEN RULES v2.0 - Números Mágicos (Monolithic Era)

**⚠️ CRITICAL: READ THIS BEFORE EXECUTING ANY CODE ⚠️**

This document establishes the **IMMUTABLE LAWS** of the `PRJT_Numeros_Magicos` project in its new **Monolithic Architecture (Hostinger VPS)**. Violating these rules leads to data loss, server crashes, and security breaches.

---

## 1. 🏗️ Architecture & Resources ( The "Iron Cage" Rule)

**Architecture:** Monolithic (Next.js + Postgres + Python ML) on a single Hostinger VPS (2 vCPU / 8GB RAM).

### 🛑 RULE 1.1: Resource Limits are Non-Negotiable

* **The Problem:** If Python uses 100% CPU, the website DIES.
* **The Law:** Every ML container **MUST** be limited by Docker.
  * Maximum CPU: **50%** (1 vCPU).
  * Maximum RAM: **50%** (4GB).
  * *The remaining 50% is exclusively for the User Interface and Database.*

### 🛑 RULE 1.2: The "Vampire" Schedule

* **The Law:** Heavy training (Retraining Neural Nets) **ONLY** runs between **04:00 AM and 07:00 AM**.
* **Enforcement:** Cron jobs trigger the training scripts.

---

## 2. 🔄 Workflow & Deployment (The "No-Touch" Rule)

### 🛑 RULE 2.1: NEVER Edit Code on the Server

* **The Danger:** If you change code on the VPS via `nano` or `vim` and the server dies, that code is gone forever.
* **The Law:**
    1. **Edit Locally** (VS Code on your PC).
    2. **Test Locally** (Docker Compose).
    3. **Push to GitHub** (`git push`).
    4. **Pull on VPS** (`git pull` + `docker compose up -d`).

### 🛑 RULE 2.2: The Server is Disposable

* Treat the VPS as if it could explode at any moment.
* **Question:** "If I delete the VPS right now, do I lose anything important?"
* **Answer MUST be:** "No, because the code is on GitHub and the Data is in the External Backup."

---

## 3. 🛡️ Security & Data Safety (The "Paranoia" Rule)

### 🛑 RULE 3.1: Database Backups

* **The Danger:** The VPS disk fails or gets corrupted.
* **The Law:** **Daily Automated Backups** to an external location (S3 / Google Drive).
* **Frequency:** Every night at 03:00 AM (Before the ML training starts).

### 🛑 RULE 3.2: Firewall (UFW)

* **The Law:**
  * **OPEN:** Ports 80 (HTTP), 443 (HTTPS), 22 (SSH - Restricted IP if possible).
  * **CLOSED:** Port 5432 (Postgres) MUST NOT be open to the internet. Access via SSH Tunnel only.

---

## 4. 🧹 Code Hygiene (The "Marie Kondo" Rule)

### 🛑 RULE 4.1: No "Junk" Folders in Production

* **Prohibited:** `Laboratory`, `Admin_Old`, `Tests_Temp`.
* **The Law:** If it's not being used by the end-user, it does not belong in the `main` branch. Use a separate `dev` branch for experiments.

### 🛑 RULE 4.2: Admin is Dead, Long Live Admin

* We removed the `/admin` interface. Administrative tasks (recalculating systems, checking logs) are done via **Scripts** in the `tools/` folder or via a secured, hidden API endpoint protected by a key, not a UI login.

---

## 5. 🚀 Execution & Scripts

* **Production Update:** `tools/prod-update.sh` (Pulls code, builds Docker, restarts).
* **Database Sync:** Since the App and DB are on the same machine, **Latency is Zero**. We no longer need complex Sync scripts between Local and Cloud. The "Truth" is now the VPS Database.
* **Local Dev:** You connect your local VS Code to a *local* copy of the DB, or a *staging* copy. **NEVER** connect local dev to Production DB for coding.

---

**Version:** 2.0 (Feb 2026) - Monolithic VPS Edition

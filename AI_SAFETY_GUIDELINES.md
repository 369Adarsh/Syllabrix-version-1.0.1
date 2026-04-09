# Syllabrix AI Safety & Architecture Guidelines

> [!IMPORTANT]
> **CRITICAL DATA ISOLATION RULE**
> Syllabrix consists of two distinct ecosystems: **Social** (Main community) and **Corporate L&D**. 
> These MUST remain physically and logically isolated.

## 1. Database Architecture
- **Social Database (`socialPool`)**: Contains core `users`, `posts`, and student/teacher profiles.
- **Corporate Database (`ldPool`)**: Contains all `ld_*` tables (Organizations, LMS, Skills, etc.).
- **Zero-Accidental-Wipe**: Never include Social tables (especially `users`) in Corporate reset or migration scripts.

## 2. Coding Rules for AI Agents
- **Pool Selection**:
    - Use `ldPool` for any file in `server/src/features/corporate/`.
    - Use `socialPool` for all other features.
- **Cross-Database Joins**:
    - When a Corporate feature needs user data, perform a **prefixed join**:
      `JOIN ${config.DB_SOCIAL.NAME}.users u ON ...`
    - This is only permitted while both databases are on the same physical server.

## 3. Destructive Operations (Resets/Migrations)
- **Isolated Resets**: Use `npm run reset:corporate` for Corporate data only.
- **Confirmation**: Always include a `y/n` confirmation prompt for any script that uses `TRUNCATE` or `DROP`.
- **Migration Scope**: Every migration file must clearly state which database it targets in the header.

## 4. Folder Structure
- Keep all Corporate Learning & Development code strictly within `server/src/features/corporate/`.
- Do not add Social dependencies to the Corporate directory unless absolutely necessary for the dual-database join.

---
*This document is a mandatory reference for all AI agents assisting with the Syllabrix codebase to prevent accidental data loss and architectural drift.*

# Syllabrix Architecture Separation & Isolation Report

This document provides a complete technical overview of the structural and operational changes made to isolate the **Syllabrix Corporate L&D** platform from the core **Syllabrix Social** ecosystem.

---

## 1. Core Objective
To ensure that the Corporate L&D features remain architecturally independent and operationally safe, preventing any accidental data loss in the Social environment (especially the `users` table) while allowing the two platforms to coexist on the same infrastructure.

---

## 2. Structural Changes (The "Move")

### 📂 Feature Isolation
Previously, L&D modules were scattered in the main `features` folder. They have been unified into a dedicated corporate sub-module:
- **Path**: `server/src/features/corporate/`
- **Modules Moved**: 
    - `ld-org`: Organization and member management.
    - `ld-skills`: Skill intelligence engine and role mapping.
    - `ld-content`: Knowledge base and tribal knowledge.
    - `ld-lms`: Course enrollment, progress, and learning path engine.

### 🌐 Routing Update
The main route index `server/src/routes/index.js` now clearly distinguishes Corporate L&D routes under the `/ld/` namespace:
```javascript
router.use('/ld/org',     require('../features/corporate/ld-org/ld-org.routes'));
router.use('/ld/skills',  require('../features/corporate/ld-skills/ld-skills.routes'));
// ... etc
```

---

## 3. Database Separation (The "Barrier")

### 🏗️ Dual-Pool Architecture
The database connection layer (`server/src/database/connection.js`) has been upgraded from a single pool to a **Dual-Pool system**:

1. **`socialPool` (Primary)**:
    - **Database Name**: Configured as `DB_SOCIAL_NAME` (e.g., `defaultdb`).
    - **Tables**: `users`, `profiles`, `posts`, `comments`, `follows`, `messages`, etc.
2. **`ldPool` (Corporate)**:
    - **Database Name**: Configured as `DB_LD_NAME` (e.g., `syllabrix_corporate`).
    - **Tables**: `ld_organizations`, `ld_enrollments`, `ld_skills`, `ld_modules`, etc.

### 🔗 Cross-Database Joins (Social-Aware)
Since the **Social `users` table** is the source of identity for both platforms, Corporate queries must sometimes "reach into" the Social database. This is handled via **Prefixed Joins**:

```sql
SELECT m.*, u.username 
FROM ld_org_members m
JOIN defaultdb.users u ON m.user_id = u.id
```
*Note: This works seamlessly while both databases reside on the same Aiven/MySQL instance.*

---

## 4. Environment Configuration

The `.env.development` and `server/src/config/env.js` now contain explicit variables for both environments:
- `DB_SOCIAL_NAME`: Usually `defaultdb`.
- `DB_LD_NAME`: Dedicated `syllabrix_corporate`.

These variables ensure that the `migrate.js` script knows exactly where to create which tables.

---

## 5. Operational Safety (The "Guards")

### 🛠️ Isolated Reset Commands
To prevent accidental data loss, the reset logic is now surgically isolated:

| Command | Database Target | Safety Description |
| :--- | :--- | :--- |
| **`npm run reset:corporate`** | `syllabrix_corporate` | **SAFE**. Truncates only L&D tables. physically cannot touch users. |
| **`npm run reset:social`** | `defaultdb` | **DESTRUCTIVE**. Truncates core social tables including `users`. |
| **`npm run reset:all`** | **BOTH** | **CRITICAL**. A global wipe of all data across both platforms. |

### 🛑 Human-In-The-Loop Confirmation
Every destructive script now uses the `readline` interface to demand a **mandatory confirmation prompt** (`y/n`) before executing any truncation.

---

## 6. Maintenance Guidelines

### 🚀 Running Migrations
The **`npm run migrate`** command is now smart:
- Files in `database/migrations/phase-ld/` are automatically routed to the **Corporate Pool**.
- All other phases (Phase 1 to 4, Fitness, etc.) are routed to the **Social Pool**.

### 🤖 AI Agent Safety
The **[AI_SAFETY_GUIDELINES.md](file:///d:/syllabrix-project/AI_SAFETY_GUIDELINES.md)** file serves as a hard reminder for any AI agent that:
1. Users live in the **Social DB**.
2. Organizations and LMS live in the **Corporate DB**.
3. **Never** include `users` in a Corporate cleanup script.

---
**Report compiled on: April 3, 2026**

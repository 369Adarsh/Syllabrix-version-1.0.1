# Syllabrix Social: Admin Control Center Architecture Guide

This document serves as the permanent architectural reference for the **Syllabrix Control Center** (Admin Panel). It is designed to help future developers, AI agents, and system architects understand how the administrative backend and frontend are structured, ensuring safe and isolated updates.

---

## 1. System Overview

The Syllabrix Admin Panel is a dedicated "meta-level" management interface built for the Syllabrix internal team. It sits on top of the Syllabrix Social application and provides strict data isolation from the Syllabrix Corporate L&D environment.

### Core Capabilities
*   **User "Workbench"**: Full control over all 200k+ global users (ban, reinstate, impersonate).
*   **Content Sentinel**: A real-time moderation queue for user-reported content.
*   **Financial Pulse**: Revenue tracking across subscriptions, courses, and donations.
*   **Audit Logging**: A tamper-proof, immutable log of every action taken by an admin.

---

## 2. Security & Authentication Architecture

Security is the primary concern for the Admin Panel. It employs a multi-layered defense mechanism.

### Backend Security (`server/src/middleware/admin-auth.middleware.js`)
*   **RBAC (Role-Based Access Control)**: The user must have `user_type = 'syllabrix_admin'` OR an explicitly defined `admin_role` (e.g., `super_admin`, `moderator`).
*   **Mandatory Two-Factor Authentication (2FA)**: Implementing TOTP via `speakeasy`. The JWT payload must contain an `is_2fa_verified` flag. If a user is an admin but 2FA is not verified, they receive a `403 Forbidden` response.

### Frontend Security (`client/src/components/admin/AdminGuard.jsx`)
*   **Client-Side Redirection**: Any non-admin account that attempts to navigate to `/admin` is instantly forced back to `/home` or `/login`. This prevents unauthorized clients from downloading admin-specific frontend chunks.

---

## 3. Database Architecture (Migration 059)

The Admin Panel relies on specific extensions to the core database (`socialPool`):

### User Extensions
*   `is_2fa_enabled` (TINYINT)
*   `totp_secret` (VARCHAR)
*   `admin_role` (ENUM: 'super_admin', 'moderator', 'support', 'finance')

### Immutable Audit Table (`admin_audit_logs`)
Every state-mutating action taken through the admin panel MUST be recorded here.
*   `admin_id`: The ID of the admin performing the action.
*   `action_type`: E.g., `user_ban`.
*   `target_type` & `target_id`: The entity affected.
*   `ip_address`: Security tracking.

---

## 4. Frontend Architecture (Next.js App Router)

The Admin panel is isolated in the `/admin` App Router segment. It utilizes a **Premium Dark-Mode Aesthetic** to differentiate it from the primary user platform.

### Directory Structure (`client/src/app/admin/`)
*   `/admin/layout.jsx`: Injects the `AdminGuard`, `AdminSidebar`, `AdminTopBar`, and `Toaster`.
*   `/admin/page.jsx`: The "Overview Core" with Recharts area visualizations and pending report summaries.
*   `/admin/users/page.jsx`: The User Workbench grid.
*   `/admin/moderation/page.jsx`: The Content Sentinel.
*   `/admin/finance/page.jsx`: The Financial Pulse with live revenue parsing.
*   `/admin/audit/page.jsx`: Display of the tamper-proof logs.

### Real-Time Alerts (`client/src/hooks/useAdminAlerts.js`)
The Admin panel utilizes WebSockets (`socket.io-client`) to listen for high-severity content reports (e.g., Hate Speech, Self Harm).
When triggered, it executes:
1.  An **Audible Alert** (`/sounds/admin-alert.mp3`).
2.  A **Browser Desktop Notification**.
3.  An **In-App Toast** via `sonner`.

### Key Frontend Dependencies
*   **`recharts`**: Used for all complex, animated data visualizations.
*   **`lucide-react`**: Standardized iconography.
*   **`sonner`**: Used for non-intrusive, stackable toast notifications.

---

## 5. Backend Architecture (Express.js)

The API logic is cleanly separated using the standard Syllabrix Controller/Service pattern.

### Routing (`server/src/features/admin/admin.routes.js`)
All routes are prefixed with `/api/admin` and pass through the `authenticateAdmin` middleware.

### Service Layer (`server/src/features/admin/admin.service.js`)
*   **`listUsers`**: Executes optimized joins to fetch user data alongside report counts and last seen status.
*   **`setUserStatus`**: Executes the actual ban/reinstate SQL queries AND triggers the insertion into `admin_audit_logs`.
*   **`getRevenueStats`**: Parses the `payments` table to aggregate lifetime, 30-day, and multi-category transaction data.

---

## 6. How to Update or Extend the Admin Panel

If you need to add a new module (e.g., "Advertising Management") to the Admin Panel, follow this strict checklist:

1.  **Backend Route**: Create a new route in `admin.routes.js` (e.g., `router.get('/ads', AdminController.getAds);`).
2.  **Service Logic**: Add the database querying logic to `admin.service.js`.
3.  **Audit Requirement**: If your new module *modifies* data (e.g., deleting an ad), you **MUST** call `await this.logAdminAction(...)` within the service method.
4.  **Frontend API Map**: Add the Axios call to `client/src/lib/api/admin.api.js`.
5.  **Frontend View**: Create the new page at `client/src/app/admin/ads/page.jsx`.
6.  **Sidebar Registration**: Add the new link to the `NAV_ITEMS` array inside `client/src/components/admin/AdminSidebar.jsx`.

> **WARNING FOR AI AGENTS**: 
> Never attempt to modify `admin-auth.middleware.js` or `AdminGuard.jsx` to bypass security checks during testing. If you need to test the Admin Panel, utilize the `hard_reset.js` database script to generate a verified Super Admin user.

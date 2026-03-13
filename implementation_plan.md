# OmniClip Refactoring Plan: Subscription Model & OAuth

This document outlines the architecture and changes required to fulfill the refactoring tasks.

## User Review Required
> [!IMPORTANT]
> - **Authentication Flow**: We are using standard Email and Password authentication. Upon successful authentication, the server will return an **Access Token (1 day)** and a **Refresh Token (7 days)** using Unix timestamps. The client will store these tokens securely and use them to maintain long-lived sessions and authenticate the WebSocket connection.
> - **Device Identity**: The Tauri client will need to send a human-readable `device_name` and `os` to the server when connecting to WebSocket, so they can be registered. The Tauri plugin `autostart` will ensure the background process automatically respawns if the device turns off or restarts.
> - **Admin Management**: A separate web application (`omniclip-admin`) will be created for admins to monitor users, manage devices, and generate promo codes. There is a strict hierarchy: one `super_admin` (`jsuunykhan2@gmail.com`), regular `admin`s (invited by super-admin), and `user`s.

## Proposed Changes

### Database Migrations
#### [NEW] `omniclip-server/migrations/20260313000000_device_management.sql`
- Add `max_allowed_devices INT NOT NULL DEFAULT 2` and `role VARCHAR(50) NOT NULL DEFAULT 'user'` to the `users` table. Valid roles: `super_admin`, `admin`, `user`.
- Create `devices` table: `id`, `user_id` (foreign key), `device_id`, `name`, `os`, `last_sync TIMESTAMPTZ`, with a unique constraint on [(user_id, device_id)](file:///i:/rust/omniclip/omniclip-client/src/App.tsx#3-20).
- Create `promo_codes` table: `code VARCHAR PRIMARY KEY`, `device_boost_count INT`, `expiry_date TIMESTAMPTZ`, `usage_limit INT`, `times_used INT DEFAULT 0`.
- Insert the default super-admin user: `jsuunykhan2@gmail.com` with the role `super_admin`.

---
### Server (`omniclip-server`)
#### [MODIFY] [omniclip-server/src/auth.rs](file:///i:/rust/omniclip/omniclip-server/src/auth.rs)
- Verify existing `/register` and `/login` routes are fully functional for email/password. Ensure the JWT includes the user's `role`.
- Implement both `access_token` and `refresh_token` generation with proper expiration (1 day vs 7 days).
- Add a route to `/refresh` to allow clients to exchange a valid refresh token for a new access token.
- Add a new authenticated endpoint `POST /api/user/promo` (in [auth.rs](file:///i:/rust/omniclip/omniclip-server/src/auth.rs) or `user.rs`) to allow applying promo codes and incrementing `users.max_allowed_devices`.

#### [NEW] `omniclip-server/src/admin.rs`
- Create admin-only REST routes for the new `omniclip-admin` dashboard to fetch lists of users, delete devices, and generate/manage promo codes.
- Create an endpoint for `super_admin` to invite/upgrade a `user` to an `admin`. Add role-based middleware to block regular users and regular admins appropriately.

#### [MODIFY] [omniclip-server/src/relay.rs](file:///i:/rust/omniclip/omniclip-server/src/relay.rs)
- Update [WsAuth](file:///i:/rust/omniclip/omniclip-server/src/relay.rs#21-24) to also accept `device_name` and `os`.
- In [ws_handler](file:///i:/rust/omniclip/omniclip-server/src/relay.rs#43-63), before upgrading to a websocket, query the `devices` table for the number of distinct devices for this `user_id`.
- If the `device_id` isn't registered and `count >= user.max_allowed_devices`, return `403 Forbidden` early.
- If allowed, UPSERT the device into `devices` and update `last_sync = NOW()`.

---
### Client (`omniclip-client`)
#### [MODIFY] [omniclip-client/src/App.css](file:///i:/rust/omniclip/omniclip-client/src/App.css) & [omniclip-client/src/App.tsx](file:///i:/rust/omniclip/omniclip-client/src/App.tsx)
- **Modern UI Redesign**: Remove old inline styles and implement a futuristic, modern, high-contrast dark theme using the latest design aesthetics and colors.
- Add a Login / Registration form for Email and Password.
- The UI should not start the background clipboard monitoring until the user is successfully logged in, and should display an error if the connection is rejected because the user has crossed their connection device limit.
- Add token refresh logic to intercept 401s or pre-refresh the access token using the stored refresh token.
- Add an input field and submit button for "Promo Code".

---
### Admin Dashboard (`omniclip-admin`)
#### [NEW] `omniclip-admin/` (React + Vite Web App)
- Initialize a brand new Next.js or Vite React application within the main repository.
- Build a modern, high-contrast dashboard for the `super_admin` and `admin` roles.
- **Pages**:
  - Login Page.
  - Users List & Details (shows connected devices per user).
  - Promo Code Management (create, view usage, revoke).
  - Admin Role Management (only visible if logged in as `super_admin`).

#### [MODIFY] [omniclip-client/src-tauri/src/main.rs](file:///i:/rust/omniclip/omniclip-client/src-tauri/src/main.rs) & [omniclip-client/src-tauri/Cargo.toml](file:///i:/rust/omniclip/omniclip-client/src-tauri/Cargo.toml)
- The Rust backend will need to hold the JWT securely or receive it from the frontend to establish the WebSocket connection. Update [main.rs](file:///i:/rust/omniclip/omniclip-server/src/main.rs) to allow starting/stopping the watcher & websocket based on login status.

#### [MODIFY] [omniclip-client/src-tauri/src/ws_client.rs](file:///i:/rust/omniclip/omniclip-client/src-tauri/src/ws_client.rs)
- Pass the real OS type and Device Name as query parameters to the WebSocket URL connection.

---
### Documentation & DevOps (`omniclip-server`)
#### [NEW] `omniclip-server/SETUP.md`
- Document how to initialize a `super_admin` and step-by-step instructions on how to re-initialize or recover the `super_admin` role if it breaks (e.g., via direct database SQL query).

#### [NEW] `omniclip-server/.github/workflows/main.yml`
- Create a server CI/CD checking workflow snippet.
- Demonstrate securely injecting GitHub secrets (e.g., `DATABASE_URL`) without committing [.env](file:///i:/rust/omniclip/omniclip-server/.env).

## Verification Plan
### Automated Tests
- Run `cargo check` and `cargo fmt` to verify Rust code compiles across both workspaces.
- Run `npm run build` on the client.

### Manual Verification
- **Dark Mode Check**: I will run the Tauri app and confirm the UI text is highly visible on both light and dark backgrounds.
- **Promo Code Test**: I will insert a dummy promo code into the DB and apply it via the UI, checking the DB for the updated `max_allowed_devices`.
- **Device Limit Test**: I will try to connect with 3 different `device_ids` concurrently for a user with a `max_allowed_devices` of 2, and verify the 3rd connection gets a `403 Forbidden`.

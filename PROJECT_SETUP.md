# OmniClip Initialization Commands

Run these commands in your preferred working directory (e.g., `~/jsunnykhan/omniclip`) to initialize the full project from scratch before dragging in the provided Rust source files.

## 1. Server Initialization (Axum)

```bash
# Create the server project
cargo new omniclip-server
cd omniclip-server

# Add dependencies
cargo add axum tokio --features tokio/full
cargo add serde serde_json --features serde/derive
cargo add sqlx --features sqlx/runtime-tokio-rustls,sqlx/postgres,sqlx/uuid,sqlx/chrono
cargo add jsonwebtoken bcrypt
cargo add tokio-tungstenite tungstenite
cargo add tower-http --features tower-http/trace,tower-http/cors
cargo add uuid --features uuid/v4,uuid/serde
cargo add chrono --features chrono/serde
cargo add tracing tracing-subscriber
cargo add dotenvy

# Setup SQLx CLI for migrations
cargo install sqlx-cli --no-default-features --features rustls,postgres
```

## 2. Client Initialization (Tauri 2.0)

```bash
# Go back to the root workspace
cd ..

# Initialize Tauri app (using Vite, React, TypeScript)
npm create tauri-app@latest omniclip-client -- --manager npm --template react-ts
cd omniclip-client

# Install frontend dependencies
npm install

# Add required Tauri plugins
npm run tauri add autostart
npm run tauri add clipboard-manager

# Add Rust dependencies to the Client
cd src-tauri
cargo add tokio --features tokio/full
cargo add serde serde_json --features serde/derive
cargo add tokio-tungstenite tungstenite
cargo add aes-gcm rand
cargo add reqwest --features reqwest/json
cargo add base64
```

After running these commands, you can copy the provided Rust source files into the respective `src/` inside `omniclip-server` and `omniclip-client/src-tauri/src/`.

## 3. Easy Setup & Running the Project

### Environment Variables (`.env`)
The server **requires** a `.env` file to configure the database and other secrets. Create a `.env` file in the `omniclip-server` directory.

Example `.env` content:
```env
POSTGRES_USER=omniclip_user
POSTGRES_PASSWORD=omniclip_password_dev
POSTGRES_DB=omniclip
POSTGRES_PORT=5432

DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}
JWT_SECRET=super_secret_development_key
```

### Running the Server locally with Docker
You can easily spin up the server and the PostgreSQL database using Docker Compose.

1. Navigate to the server directory:
   ```bash
   cd omniclip-server
   ```
2. Start the services (this will start both the DB and the axum server):
   ```bash
   docker-compose up -d
   ```
   *Note: If you only want to run the database in Docker and run the server natively via `cargo run`, you can start just the database: `docker-compose up db -d`*

### Database Migrations
To set up the database schema, you must run migrations. The project uses SQLx for this.

1. Ensure your `.env` is configured correctly and the database is running.
2. Run the migrations:
   ```bash
   cd omniclip-server
   cargo sqlx migrate run
   ```

### Client Connection
The Tauri client (React frontend) connects to the Axum server's API and WebSocket endpoints.
Ensure the server is running on the default port `3000` (or whichever port you configured in `omniclip-server`) before starting the client.

To run the client:
1. Navigate to the client directory:
   ```bash
   cd omniclip-client
   ```
2. Start the Tauri app:
   ```bash
   npm run tauri dev
   ```

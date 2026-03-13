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

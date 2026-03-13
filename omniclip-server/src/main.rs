mod auth;
mod relay;
mod logs;

use axum::Router;
use sqlx::postgres::PgPoolOptions;
use std::env;
use std::sync::Arc;
use tokio::sync::RwLock;
use tower_http::cors::CorsLayer;

use auth::{auth_routes, AppState};
use relay::{relay_routes, RelayState};
use logs::logs_routes;
use tracing_subscriber::fmt::writer::MakeWriterExt;


#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    // Enable log rotation: daily files in the "logs" directory
    let file_appender = tracing_appender::rolling::daily("logs", "omniclip-server.log");
    let (non_blocking, _guard) = tracing_appender::non_blocking(file_appender);

    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env()
                         .add_directive(tracing::Level::INFO.into()))
        .with_writer(std::io::stdout.and(non_blocking))
        .init();

    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to db");

    let app_state = Arc::new(AppState {
        db: pool,
        jwt_secret,
    });

    let relay_state = RelayState {
        app: app_state.clone(),
        channels: Arc::new(RwLock::new(std::collections::HashMap::new())),
    };

    let app = Router::new()
        .nest("/api/auth", auth_routes())
        .nest("/api/logs", logs_routes())
        .with_state(app_state)
        .merge(relay_routes(relay_state))
        .layer(CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .expect("Failed to bind port");
    
    tracing::info!("Server listening on 0.0.0.0:3000");

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post, patch},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::auth::{AppState, Claims};

#[derive(Serialize)]
pub struct AdminUser {
    pub id: Uuid,
    pub email: String,
    pub plan_type: String,
    pub role: String,
    pub max_allowed_devices: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct AdminDevice {
    pub id: Uuid,
    pub user_id: Uuid,
    pub device_id: String,
    pub name: String,
    pub os: String,
    pub last_sync: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct AdminPromo {
    pub code: String,
    pub device_boost_count: i32,
    pub usage_limit: i32,
    pub times_used: i32,
    pub expiry_date: Option<DateTime<Utc>>,
}

#[derive(Deserialize)]
pub struct CreatePromoPayload {
    pub code: String,
    pub device_boost_count: i32,
    pub usage_limit: i32,
    pub expiry_date: Option<DateTime<Utc>>,
}

pub fn admin_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/users", get(get_users))
        .route("/devices", get(get_devices))
        .route("/promo-codes", post(create_promo).get(get_promos))
        .route("/users/:id/upgrade", patch(upgrade_user))
}

fn enforce_admin(claims: &Claims) -> Result<(), (StatusCode, String)> {
    if claims.role != "super_admin" && claims.role != "admin" {
        return Err((StatusCode::FORBIDDEN, "Admin access required".to_string()));
    }
    Ok(())
}

fn enforce_super_admin(claims: &Claims) -> Result<(), (StatusCode, String)> {
    if claims.role != "super_admin" {
        return Err((StatusCode::FORBIDDEN, "Super Admin access required".to_string()));
    }
    Ok(())
}

async fn get_users(
    State(state): State<Arc<AppState>>,
    claims: Claims,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    enforce_admin(&claims)?;

    let users = sqlx::query_as!(
        AdminUser,
        "SELECT id, email, plan_type, role, max_allowed_devices, created_at FROM users ORDER BY created_at DESC"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(users))
}

async fn get_devices(
    State(state): State<Arc<AppState>>,
    claims: Claims,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    enforce_admin(&claims)?;

    let devices = sqlx::query_as!(
        AdminDevice,
        "SELECT id, user_id, device_id, name, os, last_sync FROM devices ORDER BY last_sync DESC"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(devices))
}

async fn create_promo(
    State(state): State<Arc<AppState>>,
    claims: Claims,
    Json(payload): Json<CreatePromoPayload>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    enforce_admin(&claims)?;

    let promo = sqlx::query_as!(
        AdminPromo,
        "INSERT INTO promo_codes (code, device_boost_count, usage_limit, expiry_date) VALUES ($1, $2, $3, $4) RETURNING code, device_boost_count, usage_limit, times_used, expiry_date",
        payload.code,
        payload.device_boost_count,
        payload.usage_limit,
        payload.expiry_date
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(promo))
}

async fn get_promos(
    State(state): State<Arc<AppState>>,
    claims: Claims,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    enforce_admin(&claims)?;

    let promos = sqlx::query_as!(
        AdminPromo,
        "SELECT code, device_boost_count, usage_limit, times_used, expiry_date FROM promo_codes ORDER BY code ASC"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(promos))
}

async fn upgrade_user(
    State(state): State<Arc<AppState>>,
    claims: Claims,
    Path(user_id): Path<Uuid>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    enforce_super_admin(&claims)?;

    let _ = sqlx::query!(
        "UPDATE users SET role = 'admin' WHERE id = $1 AND role = 'user'",
        user_id
    )
    .execute(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(serde_json::json!({"message": "User upgraded to admin"})))
}

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{ get, post, patch},
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
    pub user_email: String,
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

#[derive(Deserialize)]
pub struct UpdatePromoPayload {
    pub usage_limit: Option<i32>,
    pub expiry_date: Option<DateTime<Utc>>,
}

pub fn admin_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/users", get(get_users))
        .route("/users/:id/devices", get(get_user_devices))
        .route("/users/:id/upgrade", patch(upgrade_user))
        .route("/devices", get(get_devices))
        .route("/promo-codes", post(create_promo).get(get_promos))
        .route("/promo-codes/:code", patch(update_promo).delete(delete_promo))
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

async fn get_user_devices(
    State(state): State<Arc<AppState>>,
    claims: Claims,
    Path(user_id): Path<Uuid>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    enforce_admin(&claims)?;

    let devices = sqlx::query_as!(
        AdminDevice,
        "SELECT d.id, d.user_id, u.email as user_email, d.device_id, d.name, d.os, d.last_sync
         FROM devices d JOIN users u ON d.user_id = u.id
         WHERE d.user_id = $1
         ORDER BY d.last_sync DESC",
        user_id
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(devices))
}

async fn get_devices(
    State(state): State<Arc<AppState>>,
    claims: Claims,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    enforce_admin(&claims)?;

    let devices = sqlx::query_as!(
        AdminDevice,
        "SELECT d.id, d.user_id, u.email as user_email, d.device_id, d.name, d.os, d.last_sync
         FROM devices d JOIN users u ON d.user_id = u.id
         ORDER BY d.last_sync DESC"
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

async fn update_promo(
    State(state): State<Arc<AppState>>,
    claims: Claims,
    Path(code): Path<String>,
    Json(payload): Json<UpdatePromoPayload>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    enforce_admin(&claims)?;

    let promo = sqlx::query_as!(
        AdminPromo,
        "UPDATE promo_codes
         SET usage_limit = COALESCE($1, usage_limit),
             expiry_date = $2
         WHERE code = $3
         RETURNING code, device_boost_count, usage_limit, times_used, expiry_date",
        payload.usage_limit,
        payload.expiry_date,
        code
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or((StatusCode::NOT_FOUND, "Promo code not found".to_string()))?;

    Ok(Json(promo))
}

async fn delete_promo(
    State(state): State<Arc<AppState>>,
    claims: Claims,
    Path(code): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    enforce_admin(&claims)?;

    let result = sqlx::query!(
        "DELETE FROM promo_codes WHERE code = $1",
        code
    )
    .execute(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if result.rows_affected() == 0 {
        return Err((StatusCode::NOT_FOUND, "Promo code not found".to_string()));
    }

    Ok(Json(serde_json::json!({"message": "Promo code deleted"})))
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

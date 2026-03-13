use axum::{
    async_trait,
    extract::{FromRequestParts, State},
    http::{header::AUTHORIZATION, request::Parts, StatusCode},
    response::IntoResponse,
    routing::post,
    Json, Router,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use std::sync::Arc;
use uuid::Uuid;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub jwt_secret: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    pub plan_type: String,
    pub role: String,
    pub token_type: String,
    pub exp: usize,
}

#[derive(Deserialize)]
pub struct AuthPayload {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct RefreshPayload {
    pub refresh_token: String,
}

#[derive(Deserialize)]
pub struct PromoPayload {
    pub code: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub plan_type: String,
    pub role: String,
}

#[derive(FromRow)]
struct User {
    id: Uuid,
    password_hash: String,
    plan_type: String,
    role: String,
}

pub fn auth_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/refresh", post(refresh))
        .route("/promo", post(apply_promo))
}

#[async_trait]
impl FromRequestParts<Arc<AppState>> for Claims {
    type Rejection = (StatusCode, String);

    async fn from_request_parts(parts: &mut Parts, state: &Arc<AppState>) -> Result<Self, Self::Rejection> {
        let auth_header = parts.headers.get(AUTHORIZATION)
            .and_then(|value| value.to_str().ok())
            .ok_or((StatusCode::UNAUTHORIZED, "Missing Authorization header".to_string()))?;

        if !auth_header.starts_with("Bearer ") {
            return Err((StatusCode::UNAUTHORIZED, "Invalid Authorization header".to_string()));
        }

        let token = &auth_header[7..];

        let token_data = jsonwebtoken::decode::<Claims>(
            token,
            &jsonwebtoken::DecodingKey::from_secret(state.jwt_secret.as_bytes()),
            &jsonwebtoken::Validation::default(),
        ).map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid token".to_string()))?;

        if token_data.claims.token_type != "access" {
            return Err((StatusCode::UNAUTHORIZED, "Invalid token type".to_string()));
        }

        Ok(token_data.claims)
    }
}

async fn register(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<AuthPayload>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let hashed_password = hash(payload.password.as_bytes(), DEFAULT_COST)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, serde_json::json!({"error": e.to_string()}).to_string()))?;

    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, password_hash, plan_type, role"
    )
    .bind(&payload.email)
    .bind(&hashed_password)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, serde_json::json!({"error": e.to_string()}).to_string()))?;

    let (access_token, refresh_token) = generate_tokens(&user, &state.jwt_secret)?;

    Ok(Json(AuthResponse {
        access_token,
        refresh_token,
        plan_type: user.plan_type,
        role: user.role,
    }))
}

async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<AuthPayload>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let user = sqlx::query_as::<_, User>("SELECT id, password_hash, plan_type, role FROM users WHERE email = $1")
        .bind(&payload.email)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, serde_json::json!({"error": e.to_string()}).to_string()))?
        .ok_or((StatusCode::UNAUTHORIZED, serde_json::json!({"error": "Invalid credentials"}).to_string()))?;

    let is_valid = verify(payload.password.as_bytes(), &user.password_hash)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, serde_json::json!({"error": e.to_string()}).to_string()))?;

    if !is_valid {
        return Err((StatusCode::UNAUTHORIZED, serde_json::json!({"error": "Invalid credentials"}).to_string()));
    }

    let (access_token, refresh_token) = generate_tokens(&user, &state.jwt_secret)?;

    Ok(Json(AuthResponse {
        access_token,
        refresh_token,
        plan_type: user.plan_type,
        role: user.role,
    }))
}

async fn refresh(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RefreshPayload>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    use jsonwebtoken::{decode, DecodingKey, Validation};

    let token_data = decode::<Claims>(
        &payload.refresh_token,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &Validation::default(),
    ).map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid refresh token".to_string()))?;

    if token_data.claims.token_type != "refresh" {
        return Err((StatusCode::UNAUTHORIZED, "Invalid token type".to_string()));
    }

    // Generate new short-lived access token
    let now = Utc::now();
    let access_exp = now.checked_add_signed(Duration::days(1)).expect("valid timestamp").timestamp() as usize;

    let access_claims = Claims {
        sub: token_data.claims.sub,
        plan_type: token_data.claims.plan_type.clone(),
        role: token_data.claims.role.clone(),
        token_type: "access".to_string(),
        exp: access_exp,
    };

    let access_token = encode(&Header::default(), &access_claims, &EncodingKey::from_secret(state.jwt_secret.as_bytes()))
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(AuthResponse {
        access_token,
        refresh_token: payload.refresh_token,
        plan_type: token_data.claims.plan_type,
        role: token_data.claims.role,
    }))
}

async fn apply_promo(
    State(state): State<Arc<AppState>>,
    claims: Claims,
    Json(payload): Json<PromoPayload>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let promo = sqlx::query!(
        "SELECT code, device_boost_count, usage_limit, times_used, expiry_date FROM promo_codes WHERE code = $1",
        payload.code
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or((StatusCode::BAD_REQUEST, "Invalid promo code".to_string()))?;

    if let Some(exp) = promo.expiry_date {
        if Utc::now() > exp {
            return Err((StatusCode::BAD_REQUEST, "Promo code expired".to_string()));
        }
    }

    if promo.times_used >= promo.usage_limit {
        return Err((StatusCode::BAD_REQUEST, "Promo code usage limit reached".to_string()));
    }

    let mut tx = state.db.begin().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let _ = sqlx::query!(
        "UPDATE users SET max_allowed_devices = GREATEST(max_allowed_devices, $1) WHERE id = $2",
        promo.device_boost_count,
        claims.sub
    )
    .execute(&mut *tx).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let _ = sqlx::query!(
        "UPDATE promo_codes SET times_used = times_used + 1 WHERE code = $1",
        promo.code
    )
    .execute(&mut *tx).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    tx.commit().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(serde_json::json!({
        "message": "Promo code applied successfully",
        "added_devices": promo.device_boost_count
    })))
}

fn generate_tokens(user: &User, secret: &str) -> Result<(String, String), (StatusCode, String)> {
    let now = Utc::now();
    let access_exp = now.checked_add_signed(Duration::days(1)).expect("valid timestamp").timestamp() as usize;
    let refresh_exp = now.checked_add_signed(Duration::days(7)).expect("valid timestamp").timestamp() as usize;

    let access_claims = Claims {
        sub: user.id,
        plan_type: user.plan_type.clone(),
        role: user.role.clone(),
        token_type: "access".to_string(),
        exp: access_exp,
    };

    let refresh_claims = Claims {
        sub: user.id,
        plan_type: user.plan_type.clone(),
        role: user.role.clone(),
        token_type: "refresh".to_string(),
        exp: refresh_exp,
    };

    let access_token = encode(
        &Header::default(),
        &access_claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    ).map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let refresh_token = encode(
        &Header::default(),
        &refresh_claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    ).map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok((access_token, refresh_token))
}

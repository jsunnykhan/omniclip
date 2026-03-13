use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose, Engine as _};
use rand::{rngs::OsRng, RngCore};

const KEY: &[u8; 32] = b"an_example_very_secret_key_32_b!"; // In prod, this should be user-derived or securely exchanged

pub fn encrypt(plaintext: &str) -> String {
    let cipher = Aes256Gcm::new(KEY.into());
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .expect("encryption failure!");

    let mut combined = nonce_bytes.to_vec();
    combined.extend_from_slice(&ciphertext);
    
    general_purpose::STANDARD.encode(combined)
}

pub fn decrypt(encoded: &str) -> Option<String> {
    let decoded = general_purpose::STANDARD.decode(encoded).ok()?;
    if decoded.len() < 12 {
        return None;
    }

    let cipher = Aes256Gcm::new(KEY.into());
    let nonce = Nonce::from_slice(&decoded[..12]);
    let ciphertext = &decoded[12..];

    let plaintext = cipher.decrypt(nonce, ciphertext).ok()?;
    String::from_utf8(plaintext).ok()
}

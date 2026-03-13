#[cfg(test)]
mod tests {
    use crate::crypto::{decrypt, encrypt};

    #[test]
    fn test_crypto_round_trip() {
        let plaintext = "Hello OmniClip! This is a secure payload.";
        let encrypted = encrypt(plaintext);
        
        assert_ne!(plaintext, encrypted);
        
        let decrypted = decrypt(&encrypted).expect("Failed to decrypt");
        assert_eq!(plaintext, decrypted);
    }

    #[test]
    fn test_invalid_decryption() {
        let invalid = "invalid_base64_string";
        let result = decrypt(invalid);
        assert!(result.is_none());
    }

    // Note: Due to Tauri's clipboard plugin requiring a running AppHandle,
    // Unit tests for the direct watcher/clipboard manager require integration testing 
    // against the Tauri mock API. We mock the crypto logic closely tied to the watcher here.
}

module ProductVerification::ProductVerification {
    use std::signer;
    use std::string::String;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    // Struct to store product verification data with counter for multiple verifications
    struct ProductVerificationData has key {
        brand_name: String,
        product_id: String,
        user_address: address,
        transaction_hash: String,
        match_status: String,
        action: String,
        timestamp: u64,
        verification_count: u64
    }

    // Event emitted when verification is recorded
    #[event]
    struct VerificationRecordedEvent has drop, store {
        verifier: address,
        product_id: String,
        brand_name: String,
        user_address: address,
        transaction_hash: String,
        match_status: String,
        action: String,
        timestamp: u64,
        verification_number: u64
    }

    // Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;

    // Initialize the module for first-time use
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        // Check if already initialized
        assert!(!exists<ProductVerificationData>(account_addr), E_ALREADY_INITIALIZED);
        
        // Create initial empty verification data
        move_to(account, ProductVerificationData {
            brand_name: std::string::utf8(b""),
            product_id: std::string::utf8(b""),
            user_address: @0x0,
            transaction_hash: std::string::utf8(b""),
            match_status: std::string::utf8(b""),
            action: std::string::utf8(b""),
            timestamp: 0,
            verification_count: 0
        });
    }

    // Record product verification on blockchain and emit event with details
    public entry fun record_verification(
        account: &signer,
        brand_name: String,
        product_id: String,
        user_address: address,
        transaction_hash: String,
        match_status: String,
        action: String
    ) acquires ProductVerificationData {
        let verifier_address = signer::address_of(account);
        let current_timestamp = timestamp::now_seconds();

        // Initialize if not already done
        if (!exists<ProductVerificationData>(verifier_address)) {
            initialize(account);
        };

        // Update the verification data
        let verification_data = borrow_global_mut<ProductVerificationData>(verifier_address);
        verification_data.brand_name = brand_name;
        verification_data.product_id = product_id;
        verification_data.user_address = user_address;
        verification_data.transaction_hash = transaction_hash;
        verification_data.match_status = match_status;
        verification_data.action = action;
        verification_data.timestamp = current_timestamp;
        verification_data.verification_count = verification_data.verification_count + 1;

        // Emit event with all verification details
        event::emit(VerificationRecordedEvent {
            verifier: verifier_address,
            product_id,
            brand_name,
            user_address,
            transaction_hash,
            match_status,
            action,
            timestamp: current_timestamp,
            verification_number: verification_data.verification_count
        });
    }

    // View function to check if verification data exists
    #[view]
    public fun has_data(account_addr: address): bool {
        exists<ProductVerificationData>(account_addr)
    }

    // View function to get verification count
    #[view]
    public fun get_verification_count(account_addr: address): u64 acquires ProductVerificationData {
        if (!exists<ProductVerificationData>(account_addr)) {
            return 0
        };
        let verification_data = borrow_global<ProductVerificationData>(account_addr);
        verification_data.verification_count
    }

    // View function to get last verification details
    #[view]
    public fun get_last_verification(account_addr: address): (String, String, address, String, String, String, u64) acquires ProductVerificationData {
        assert!(exists<ProductVerificationData>(account_addr), E_NOT_INITIALIZED);
        let verification_data = borrow_global<ProductVerificationData>(account_addr);
        (
            verification_data.brand_name,
            verification_data.product_id,
            verification_data.user_address,
            verification_data.transaction_hash,
            verification_data.match_status,
            verification_data.action,
            verification_data.timestamp
        )
    }
}
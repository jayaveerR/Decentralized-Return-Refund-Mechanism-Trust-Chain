module product::product_return_v6 {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};

    // Error codes
    const E_PRODUCT_EXISTS: u64 = 1;
    const E_PRODUCT_NOT_FOUND: u64 = 2;
    const E_NOT_OWNER: u64 = 3;
    const E_PRODUCT_ALREADY_RETURNED: u64 = 4;
    const E_NO_PRODUCTS_STORE: u64 = 5;

    struct ProductItem has key, store, copy, drop {
        product_id: String,
        order_id: String,
        brand: String,
        owner_address: address,
        created_at: u64,
        is_returned: bool,
        return_date: u64,
        transaction_hash: String,
    }

    struct ProductStore has key {
        products: Table<String, ProductItem>,
        product_ids: vector<String>,
        product_count: u64,
    }

    // Events
    #[event]
    struct ProductAddedEvent has drop, store {
        product_id: String,
        order_id: String,
        brand: String,
        owner_address: address,
        timestamp: u64,
        transaction_hash: String,
    }

    #[event]
    struct ProductReturnedEvent has drop, store {
        product_id: String,
        returned_by: address,
        return_date: u64,
    }

    // Initialize product store
    public fun init_product_store(account: &signer) {
        let addr = signer::address_of(account);
        if (!exists<ProductStore>(addr)) {
            move_to(account, ProductStore {
                products: table::new(),
                product_ids: vector::empty(),
                product_count: 0,
            });
        }
    }

    // Add product with transaction hash
    public entry fun add_product(
        account: &signer,
        product_id: String,
        order_id: String,
        brand: String,
        transaction_hash: String,
    ) acquires ProductStore {
        let current_timestamp = timestamp::now_seconds();
        let owner_address = signer::address_of(account);

        init_product_store(account);
        let product_store = borrow_global_mut<ProductStore>(owner_address);

        assert!(
            !table::contains(&product_store.products, product_id),
            E_PRODUCT_EXISTS
        );

        let product_item = ProductItem {
            product_id: copy product_id,
            order_id: order_id,
            brand: brand,
            owner_address,
            created_at: current_timestamp,
            is_returned: false,
            return_date: 0,
            transaction_hash: transaction_hash,
        };

        table::add(&mut product_store.products, product_id, product_item);
        vector::push_back(&mut product_store.product_ids, copy product_id);
        product_store.product_count = product_store.product_count + 1;

        event::emit(ProductAddedEvent {
            product_id: product_id,
            order_id: order_id,
            brand: brand,
            owner_address: owner_address,
            timestamp: current_timestamp,
            transaction_hash: transaction_hash,
        });
    }

    // Return product
    public entry fun return_product(
        account: &signer,
        product_id: String,
    ) acquires ProductStore {
        let returned_by = signer::address_of(account);
        let current_timestamp = timestamp::now_seconds();

        assert!(exists<ProductStore>(returned_by), E_NO_PRODUCTS_STORE);
        let product_store = borrow_global_mut<ProductStore>(returned_by);
        assert!(table::contains(&product_store.products, product_id), E_PRODUCT_NOT_FOUND);

        let product_item = table::borrow_mut(&mut product_store.products, product_id);
        assert!(product_item.owner_address == returned_by, E_NOT_OWNER);
        assert!(!product_item.is_returned, E_PRODUCT_ALREADY_RETURNED);

        product_item.is_returned = true;
        product_item.return_date = current_timestamp;

        event::emit(ProductReturnedEvent {
            product_id: product_id,
            returned_by: returned_by,
            return_date: current_timestamp,
        });
    }

    // View functions
    public fun get_product_by_id(account_addr: address, product_id: String): ProductItem acquires ProductStore {
        assert!(exists<ProductStore>(account_addr), E_NO_PRODUCTS_STORE);
        let product_store = borrow_global<ProductStore>(account_addr);
        assert!(table::contains(&product_store.products, product_id), E_PRODUCT_NOT_FOUND);
        *table::borrow(&product_store.products, product_id)
    }

    public fun get_all_product_ids(account_addr: address): vector<String> acquires ProductStore {
        if (!exists<ProductStore>(account_addr)) {
            return vector::empty<String>()
        };
        borrow_global<ProductStore>(account_addr).product_ids
    }

    public fun get_product_count(account_addr: address): u64 acquires ProductStore {
        if (!exists<ProductStore>(account_addr)) {
            return 0
        };
        borrow_global<ProductStore>(account_addr).product_count
    }

    public fun product_exists(account_addr: address, product_id: String): bool acquires ProductStore {
        if (!exists<ProductStore>(account_addr)) {
            return false
        };
        let product_store = borrow_global<ProductStore>(account_addr);
        table::contains(&product_store.products, product_id)
    }

    public fun is_product_returned(account_addr: address, product_id: String): bool acquires ProductStore {
        if (!exists<ProductStore>(account_addr)) {
            return false
        };
        let product_store = borrow_global<ProductStore>(account_addr);
        if (!table::contains(&product_store.products, product_id)) {
            return false
        };
        table::borrow(&product_store.products, product_id).is_returned
    }

    #[test_only]
    use std::string;

    #[test(owner = @0x1)]
    public fun test_product_management(owner: &signer) acquires ProductStore {
        let owner_addr = signer::address_of(owner);
        
        add_product(
            owner,
            string::utf8(b"product_001"),
            string::utf8(b"order_123"),
            string::utf8(b"Brand1"),
            string::utf8(b"txn_hash_001")
        );
        
        assert!(product_exists(owner_addr, string::utf8(b"product_001")), 1);
        assert!(!is_product_returned(owner_addr, string::utf8(b"product_001")), 2);
        
        return_product(owner, string::utf8(b"product_001"));
        assert!(is_product_returned(owner_addr, string::utf8(b"product_001")), 3);
    }
}
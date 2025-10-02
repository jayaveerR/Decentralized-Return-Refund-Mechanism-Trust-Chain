# Decentralized Return & Refund Trust Chain -  

 A blockchain-powered solution for fraud-proof product returns and refunds in e-commerce.
 Secure: Eliminates fake return claims with immutable on-chain verification.
 Transparent: Every transaction and verification is recorded on the Aptos blockchain.
 Efficient: Streamlined refund and replacement process across all platforms, reducing disputes and saving time.
  >
##### 👉 Built with Aptos blockchain smart contracts for trustless product verification and a modern React + Vite frontend for seamless user experience.

## ScreenShort

# Dashboard -

##### This system builds trust between customers and e-commerce platforms, ensuring that refunds and product returns are secure, transparent, and efficient.

![image alt](https://github.com/jayaveerR/Decentralized-Return-RefundMechanism-Trust-Chai/blob/5c6cebe8738d7c93dfde0ba9128ecb4b4fb45d58/images/Dashboard.png)

# Add Item -
The image you uploaded shows the “Add Item to Trust-Chain” page of your project BlockVerify
This page allows sellers/brands to register a product on the Aptos blockchain for authenticity tracking.

Fields & Info shown in the form: -

Product ID → A unique identifier for the product..

Order ID → An order reference/transaction identifier..

Brand → The brand or company name associated with the product..

Owner Wallet Address → The blockchain wallet of the product owner/seller (in this case: 0x6b1ba...9790a)..


![image alt](https://github.com/jayaveerR/Decentralized-Return-RefundMechanism-Trust-Chai/blob/5c6cebe8738d7c93dfde0ba9128ecb4b4fb45d58/images/Additems.png)

# My Orders -

The Smart Product Verify Return & Refund System is a blockchain-based solution designed to ensure secure, transparent, and efficient product returns and refunds. Sellers register products, and each transaction generates a unique hash code.

Seller can pay 0.2 APT (fixed amount).

Once paid, the transaction hash is stored & displayed (like your screenshot).

It should also show items + payment status.

![image alt](https://github.com/jayaveerR/Decentralized-Return-RefundMechanism-Trust-Chai/blob/5c6cebe8738d7c93dfde0ba9128ecb4b4fb45d58/images/tranectionhash.png)

# Generate QR Code Transaction Hash -

Paste the transaction hash and click “Generate QR Code.”

![image alt](https://github.com/jayaveerR/Decentralized-Return-RefundMechanism-Trust-Chai/blob/5c6cebe8738d7c93dfde0ba9128ecb4b4fb45d58/images/GenerateQr.png)

Easily share or verify the transaction with buyers via the QR code.

![image alt](https://github.com/jayaveerR/Decentralized-Return-RefundMechanism-Trust-Chai/blob/5c6cebe8738d7c93dfde0ba9128ecb4b4fb45d58/images/Qrcode.png)

# Smart Product Verify Return & Refund System -
When a buyer returns a product, the delivery boy scans the QR code to view product details such as brand, product ID, and buyer address. 

![image alt](https://github.com/jayaveerR/Decentralized-Return-RefundMechanism-Trust-Chai/blob/5c6cebe8738d7c93dfde0ba9128ecb4b4fb45d58/images/verify.png)

By verifying whether the product matches the original purchase, the system records the result on the blockchain.

![image alt](https://github.com/jayaveerR/Decentralized-Return-RefundMechanism-Trust-Chai/blob/5c6cebe8738d7c93dfde0ba9128ecb4b4fb45d58/images/verifydetails.png)

# Sucess Transaction Product Match -

When the returned product matches the original purchase:
The system records a successful verification on the blockchain.
A transaction hash is generated for this match.
The hash is shared with the product owner (e.g., via WhatsApp) for secure confirmation.

![image alt](https://github.com/jayaveerR/Decentralized-Return-RefundMechanism-Trust-Chai/blob/e8a4e7f3431069d701fe6c8e1e8efb308f270770/images/Success.png)

# Failed Transaction Product MisMatch -

When the returned product does not match the original purchase:
The system records a failed verification on the blockchain.
A transaction hash is generated for this mismatch.


![image alt](https://github.com/jayaveerR/Decentralized-Return-RefundMechanism-Trust-Chai/blob/e8a4e7f3431069d701fe6c8e1e8efb308f270770/images/Failed.png)

# WhatsApp QR Scanner
Instantly scan QR codes and connect seamlessly through WhatsApp with enhanced security

A transaction hash is then generated and shared with the product owner via WhatsApp for instant verification.

![image alt](https://github.com/jayaveerR/Decentralized-Return-RefundMechanism-Trust-Chai/blob/caba2bb92646c9fcf2914ae0174e48c148530086/images/SendQRWhatsapp.png)

# ENIVIRONMENT

### Create a  `.env` from `.env.sample` and fill the values. Required keys:

```env

VITE_APP_NETWORK=Testnet
PROJECT_NAME=decentralized-product-return-trust-chain
VITE_APTOS_API_KEY=""
VITE_MODULE_ADDRESS=0xfa1c12cc2e127047b02bc951d71d376cf25b9db220d213bfa972f45c0c55de38
NFT_STORAGE_KEY=9b58937b.75c14a8de6354943a99c8288f6c86574
```
The Move module name is product. Frontend derives fully-qualified function names from VITE_MODULE_ADDRESS.

# 🚀 How to Run the Project

### 1. Clone the Repository
```bash
git clone https://github.com/jayaveerR/Decentralized-Return-RefundMechanism-Trust-Chai.git
cd Decentralized-Return-RefundMechanism-Trust-Chai
```
### 2. Install Dependencies
##### Make sure you have Node.js and npm installed. Then run:
```
npm install
```
### 3. Setup Environment Variables
#### Copy the sample `.env` file:
```
cp .env.sample .env
```
### 4. Run the Development Server
```
npm run dev
```
Then open the URL shown in the terminal (usually http://localhost:5173
)
#### 5. Build for Production (optional)
```
npm run build
```

### 🔹 How the System Works

### 1.Order Placement
  * A buyer orders a product from an online platform (Flipkart, Amazon, Myntra, etc.).
  * The platform generates a unique Order ID for that purchase.

### 2.Seller Registration
   * Once the order is confirmed, the seller registers the product on the decentralized system.
   * Details stored on blockchain include:
       * Product ID
       * Order ID (unique to the buyer)
       * Brand Name
       * Seller’s Wallet Address
  * A Transaction Hash is generated after successful registration.

## 3.QR Code Creation
* The Transaction Hash is converted into a QR Code
* This QR Code is:
    * Printed and attached to the product (like a digital authenticity tag).
    * Shared with the buyer via WhatsApp/email for reference.
* A warning message is displayed:
  * “Do not remove this QR tag. If removed, return & refund will not be accepted.”

### 4.Delivery
 * The product is delivered to the buyer with the QR code attached.
 * The QR code ensures that the product is authentic and traceable.

### 5.Return Process
* If the buyer wants to return the product, the delivery boy scans the QR code.
* The system checks the blockchain record to verify the product details.

### 6.Verification Results
* ✅ Product Match (Success) → If details match the blockchain record, return is accepted.
   * Message: “Product Verification Success”
* ❌ Product Mismatch (Failed) → If details do not match, return is rejected.
   * Message: “Return Initiated – Product Mismatch”

## 7.Proof & Transparency
* Each scan generates a new verification hash.
* This hash is sent to the seller via WhatsApp, providing proof of the product’s authenticity or mismatch.
* Both seller and buyer have a tamper-proof blockchain record of the transaction.

## ⚡ End Result:
* Sellers are protected from fake returns.
* Buyers get transparent return verification.
* The system ensures trust, security, and accountability in e-commerce returns.

📝 Note
  * Every product registered in this system is linked with a unique Order ID, Product ID, Brand, and Seller Wallet Address stored on the blockchain
  * The QR code attached to the product acts as a digital authenticity tag.
  * Do not remove or damage the QR code. If the tag is missing or tampered with, the return and refund request will not be accepted.
  * During a return, the delivery agent must scan the QR code to verify details.
  * Return is only successful if the scanned details match the blockchain record. Otherwise, the system will reject the return automatically.
  * All transactions and verifications generate immutable blockchain records, ensuring security, trust, and transparency for both buyers and sellers.











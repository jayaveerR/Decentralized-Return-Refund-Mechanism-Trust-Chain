import { AptosClient, AptosAccount, FaucetClient, BCS, TxnBuilderTypes } from "aptos";
import { readFileSync } from "fs";
import path from "path";

const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
const FAUCET_URL = "https://faucet.testnet.aptoslabs.com";

const MODULE_ADDRESS = "0xfa1c12cc2e127047b02bc951d71d376cf25b9db220d213bfa972f45c0c55de38";

async function deployContract() {
    const client = new AptosClient(NODE_URL);
    const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

    // Load private key from environment variable or config
    const privateKeyHex = process.env.DEPLOYER_PRIVATE_KEY;
    if (!privateKeyHex) {
        throw new Error("DEPLOYER_PRIVATE_KEY environment variable is required");
    }

    const deployer = new AptosAccount(Buffer.from(privateKeyHex, "hex"));
    
    console.log("Deployer address:", deployer.address().toString());
    console.log("Module address:", MODULE_ADDRESS);

    // Fund the account if needed
    await faucetClient.fundAccount(deployer.address(), 100_000_000);

    // Read the Move module
    const modulePath = path.join(__dirname, "../build/product_return/bytecode_modules/product_return.mv");
    const moduleHex = readFileSync(modulePath).toString("hex");
    
    const moduleBundle = new TxnBuilderTypes.ModuleBundle([
        new TxnBuilderTypes.Module(new HexString(moduleHex).toUint8Array())
    ]);

    const payload = new TxnBuilderTypes.TransactionPayloadModuleBundle(moduleBundle);

    const transaction = await client.generateTransaction(
        deployer.address(),
        payload,
        { max_gas_amount: "10000" }
    );

    const signedTxn = await client.signTransaction(deployer, transaction);
    const transactionRes = await client.submitTransaction(signedTxn);
    
    await client.waitForTransaction(transactionRes.hash);

    console.log("Contract deployed successfully!");
    console.log("Transaction hash:", transactionRes.hash);
    console.log("Explorer URL:", `https://explorer.aptoslabs.com/txn/${transactionRes.hash}?network=testnet`);
}

deployContract().catch(console.error);
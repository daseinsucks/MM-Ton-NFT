import { beginCell, contractAddress, toNano, Cell, Address, TonClient4, WalletContractV4 } from "@ton/ton";
import { deploy } from "./utils/deploy";
import { printAddress, printDeploy, printHeader } from "./utils/print";
import * as fs from "fs";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import * as dotenv from "dotenv";
dotenv.config();
// ================================================================= //
import { VoucherCollection } from "./output/MM-NFT_VoucherCollection";
// ================================================================= //

(async () => {
    const client = new TonClient4({
        // endpoint: "https://mainnet-v4.tonhubapi.com", // 🔴 Main-net API endpoint
        endpoint: "https://sandbox-v4.tonhubapi.com", // 🔴 Test-net API endpoint
    });

    // Parameters
    let collection_address = Address.parse("kQDouS9praSMkTQjBnLd8NMGXGCr73_f8PZr1hulnomJ9X5b");

    let contract_address = await VoucherCollection.fromAddress(collection_address);
    let client_open = client.open(contract_address);
    let mnemonic = (process.env.mnemonics || "").toString();
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
   
  
    // open wallet and read the current seqno of the wallet
    const walletContract = client.open(wallet);
    const walletSender = walletContract.sender(key.secretKey);

  const res = await client_open.send(walletSender, { value: toNano(0.04), bounce: false }, "Mint");
  console.log(res)
    

})();



import {
    Address,
    beginCell,
    contractAddress,
    toNano,
    TonClient4,
    internal,
    fromNano,
    WalletContractV4,
} from "@ton/ton";
import { deploy } from "./utils/deploy";
import { printAddress, printDeploy, printHeader, printSeparator } from "./utils/print";
import { mnemonicToPrivateKey } from "@ton/crypto";
import * as dotenv from "dotenv";
dotenv.config();
// ================================================================= //
import { VoucherCollection } from "./output/MM-NFT_VoucherCollection";
import { Voucher } from "./output/MM-NFT_Voucher";
// ================================================================= //

import { getHttpV4Endpoint } from "@orbs-network/ton-access";


// get the decentralized RPC endpoint


// initialize ton library

(async () => {
    const endpoint = await getHttpV4Endpoint({

      });
    try {
        // Create client for testnet sandboxv4 API - alternative endpoint
        const client4 = new TonClient4({ endpoint });
        // Parameters for NFTs
        const OFFCHAIN_CONTENT_PREFIX = 0x01;
        const item_link = "https://ipfs.io/ipfs/QmcysCFEJrJfQ937XDcPkyXJqvifUd6jBnJJ3bd5Dz9YKC"; // Change to the content URL you prepared
        let itemContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(item_link).endCell();

        const collection_link = "https://ipfs.io/ipfs/QmXUgmCAaGnVseJuza8y3baDD9JK4oexmptWPxK7VW4hpU"; // Change to the content URL you prepared
        let collectionContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(collection_link).endCell();

        let mnemonic = (process.env.mnemonics || "").toString();
        let keyPair = await mnemonicToPrivateKey(mnemonic.split(" "));
        let secretKey = keyPair.secretKey;
        let workchain = 0;
        let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
        let wallet_contract = client4.open(wallet);
        console.log("Wallet address: ", wallet_contract.address);
        let treasury = Address.parse("UQD7q-FZjYmMA00mBGgM_317OCylWk-5C6NSL4ToEXcKbbev");
        // Replace owner with your address
        let owner = wallet.address;
        let uniqueNonce = BigInt(Date.now());
        let supply = BigInt(1000)
        console.log("Unique nonce: ", uniqueNonce);
        // Prepare the initial code and data for the contract
        let init = await VoucherCollection.init(owner, itemContent, collectionContent, {
            $$type: "RoyaltyParams",
            numerator: 50n, // 50n = 5%
            denominator: 1000n,
            destination: owner,
        }, uniqueNonce, supply, treasury);
        let deployContract = contractAddress(0, init);
        
        // Ensure the contract address is new
        console.log("Calculated new contract address: ", deployContract.toString());

        // ========================================
        let packed = beginCell().storeUint(0, 32).storeStringTail("Mint").endCell();
        // ========================================
        let deployAmount = toNano("0.3");
        let seqno = await wallet_contract.getSeqno();
        let balance = await wallet_contract.getBalance();
        // ========================================
        console.log("Current deployment wallet balance: ", fromNano(balance).toString(), "💎TON");
        printSeparator();
        console.log("Deploying contract to address: ", deployContract.toString());

        await wallet_contract.sendTransfer({
            seqno,
            secretKey,
            messages: [
                internal({
                    to: deployContract,
                    value: deployAmount,
                    init: { code: init.code, data: init.data },
                    bounce: true,
                    body: packed,
                }),
            ],
        });

        let collection_client = client4.open(VoucherCollection.fromAddress(deployContract));
        let latest_indexId = (await collection_client.getGetCollectionData()).next_item_index;
        console.log("Latest indexID:[", latest_indexId, "]");
        let item_address = await collection_client.getGetNftAddressByIndex(latest_indexId);
        console.log("Minting NFT Item: ", item_address!.toString());
    } catch (error) {
        console.error("An error occurred during the deployment process: ", error);
    }
})();

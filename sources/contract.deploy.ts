import { beginCell, contractAddress, toNano, Address } from "@ton/ton";
import { deploy } from "./utils/deploy";
import { printAddress, printDeploy, printHeader } from "./utils/print";
// ================================================================= //
import { VoucherCollection } from "./output/MM-NFT_VoucherCollection";
// ================================================================= //

(async () => {
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://ipfs.io/ipfs/QmRmiALqS1mPhZLmH9mpXfd4j73jpa7kSLPqVPKByySuwY/1.json"; // Change to the content URL you prepared
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();

    // ===== Parameters =====
    // Replace owner with your address
    let owner = Address.parse("UQBtQoMmK74ty03hcCicDUVNtVc9DhyT-_LLgDqZ57iD_VHF"); // 🔴🔴🔴


    // Prepare the initial code and data for the contract
    let init = await VoucherCollection.init(owner, newContent, {
        $$type: "RoyaltyParams",
        numerator: 50n, // 350n = 35%
        denominator: 1000n,
        destination: owner,
    });

    let address = contractAddress(0, init);
    let deployAmount = toNano("0.15");
    let testnet = true;

    // The Transaction body we want to pass to the smart contract
    let body = beginCell().storeUint(0, 32).storeStringTail("Mint").endCell();

    // Do deploy
    await deploy(init, deployAmount, body, testnet);
    printHeader("sampleNFT_Contract");
    printAddress(address);
})();
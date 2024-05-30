import { beginCell, contractAddress, toNano, Cell, Address, TonClient4, WalletContractV4 } from "@ton/ton";
import { mnemonicToWalletKey } from "ton-crypto";
import * as dotenv from "dotenv";
dotenv.config();
// ================================================================= //
import { VoucherCollection, MintByOwner, ChangeOwner } from "./output/MM-NFT_VoucherCollection";
// ================================================================= //

import { getHttpV4Endpoint } from "@orbs-network/ton-access";


let new_address = Address.parse("UQD7q-FZjYmMA00mBGgM_317OCylWk-5C6NSL4ToEXcKbbev"); //получаем с кошелька пользователя через tonconnect


const Msg: ChangeOwner= {
  $$type: 'ChangeOwner',
  new_owner: new_address  
};
const endpoint = await getHttpV4Endpoint({

});

(async () => {
    const client = new TonClient4({
        endpoint: endpoint 
    });

    // Parameters
    let collection_address = Address.parse("EQDAlAI6ZGe7xTBELbenPM4bnkMyb28bBVCg21TZM7cGKSWA"); //адрес коллекции

    let contract_address = await VoucherCollection.fromAddress(collection_address);
    let client_open = client.open(contract_address);



    let mnemonic = (process.env.mnemonics || "").toString(); //загружаем с .енв фразу кошелька, с которого деплоили
    const key = await mnemonicToWalletKey(mnemonic.split(" ")); 
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
   
    const walletContract = client.open(wallet);
    const walletSender = walletContract.sender(key.secretKey);
    await client_open.send(walletSender, { value: toNano(0.05), bounce: false }, Msg); //сама транза

  })
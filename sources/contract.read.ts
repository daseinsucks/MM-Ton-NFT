import { beginCell, contractAddress, toNano, Cell, Address, TonClient4, WalletContractV4 } from "@ton/ton";
import { deploy } from "./utils/deploy";
import { printAddress, printDeploy, printHeader } from "./utils/print";
import * as fs from "fs";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import * as dotenv from "dotenv";
dotenv.config();
// ================================================================= //
import { VoucherCollection, MintByOwner } from "./output/MM-NFT_VoucherCollection";
// ================================================================= //


// ЛОГИКА:
// 1. Юзер жмет "купить"
// 2. Проверяем наш баланс (минт за наш счет), проверяем, что нфт еще есть в наличии
// 3. Замораживаем баланс юзера на бэке
// 4. Запускаем минт
// 5. Ждем, пока транза пройдет
// 6. Смотрим, увеличилось ли общее количество НФТ в коллекции
//   6.1. Если да -- говорим бэку, что у нас все ок
//   6.2. Если нет -- говорим бэку, что транза не прошла и надо вернуть деньги юзеру
// 7. Готово 
 

let user_address = Address.parse("UQBtQoMmK74ty03hcCicDUVNtVc9DhyT-_LLgDqZ57iD_VHF"); //получаем с кошелька пользователя через tonconnect


const MintMsg: MintByOwner= {
  $$type: 'MintByOwner',
  mint_to: user_address  
};

const delay = (ms: number)  => new Promise(res => setTimeout(res, ms));

(async () => {
    const client = new TonClient4({
        // endpoint: "https://mainnet-v4.tonhubapi.com", // 🔴 Main-net API endpoint
        endpoint: "https://sandbox-v4.tonhubapi.com", // 🔴 Test-net API endpoint
    });

    // Parameters
    let collection_address = Address.parse("EQDAlAI6ZGe7xTBELbenPM4bnkMyb28bBVCg21TZM7cGKSWA"); //адрес коллекции, выносим в .енв

    let contract_address = await VoucherCollection.fromAddress(collection_address);
    let client_open = client.open(contract_address);

const collectiondata = await client_open.getGetCollectionData()
const index = Number(collectiondata.next_item_index)


let totalSupply = 1000  //тоже в .енв. Отвечает за максимальное количество НФТ, которое может выпустить контракт (выставил 1000 по умолчанию)
if (index <= totalSupply) {


    let mnemonic = (process.env.mnemonics || "").toString(); //загружаем с .енв фразу кошелька, с которого деплоили
    const key = await mnemonicToWalletKey(mnemonic.split(" ")); 
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
   
  
    // open wallet and read the current seqno of the wallet
    const walletContract = client.open(wallet);
    const walletSender = walletContract.sender(key.secretKey);
   let balance = await walletContract.getBalance() //проверяем наш баланс (нужно 0.3, чтобы транза прошла без проблем)
   
   
   if (balance >= toNano(0.3)) {

    //здесь функция заморзки денег юзера на бэке

    await client_open.send(walletSender, { value: toNano(0.3), bounce: false }, MintMsg); //сама транза на минт

    //я не уверен, можно ли так делать на фронте
    await delay(45000) //ждем, пока пройдет транза

    const newdata = await client_open.getGetCollectionData() //получаем новый последний индекс коллекции
    const newindex = Number(newdata.next_item_index)


  
     if (newindex > index) {
      //здесь функция сообщения бэку, что все успешно
      console.log("Success")
     } else {
      //здесь функция разморозки 
      console.log("Fail")
     }



   } else {
console.log("Insufficient balance of deployer's wallet")
 }
  
} else {
  console.log("Maximum amount of NFT minted :(")
}

})();
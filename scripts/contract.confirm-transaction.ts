import { ethers } from "hardhat";
import { Multisig } from "../typechain";
import { getContractAddress, getOwnersWallets, requestTxId } from "../lib";
const MultisigContract = require("../artifacts/contracts/Multisig.sol/Multisig.json");


let TRANSACTION_ID: number | null = null;
const OWNER_ID = 1;

async function main() {
  const contractAddress = getContractAddress();
  const ownersWallets = getOwnersWallets();
  const signer = ownersWallets[OWNER_ID];

  const contract = (new ethers.Contract(contractAddress, MultisigContract.abi, signer)) as Multisig;
  contract.on("TransactionConfirmed", (ev) => {
    console.log('===== TransactionConfirmed event emmited =====');
    console.log(ev);
  });

  if (TRANSACTION_ID === null) {
    ({ TRANSACTION_ID } = await requestTxId());
  }


  console.log('confirming transaction...');

  const tx = await contract.confirmTransaction(TRANSACTION_ID);
  console.log(`transaction sent & waiting for confirmation. see more details for:`, tx.hash);

  await tx.wait();
  console.log('done!');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error("main error");
    console.error(error);
    process.exit(1);
  });

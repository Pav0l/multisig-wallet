import { ethers } from "hardhat";
import { Multisig } from "../typechain";
import { getContractAddress, getOwnersWallets, requestTxId } from "../lib";
const MultisigContract = require("../artifacts/contracts/Multisig.sol/Multisig.json");

let TRANSACTION_ID: number | null = null;
const OWNER_ID = 1;

async function main() {
  const contractAddress = getContractAddress();
  const owners = getOwnersWallets();
  const signer = owners[OWNER_ID];

  const contract = (new ethers.Contract(contractAddress, MultisigContract.abi, signer)) as Multisig;
  contract.on("TransactionExecuted", (ev) => {
    console.log('===== TransactionExecuted event emmited =====');
    console.log(ev);
  });


  if (TRANSACTION_ID === null) {
    ({ TRANSACTION_ID } = await requestTxId());
  }

  console.log(`Executing transaction with ID:${TRANSACTION_ID}...`)
  const tx = await contract.executeTransaction(TRANSACTION_ID);
  console.log('Transaction executed, waiting for confirmation...', tx.hash);
  const receipt = await tx.wait();
  console.log('DONE!');
  console.log(receipt);
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

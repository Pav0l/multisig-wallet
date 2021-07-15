import { ethers } from "hardhat";
import { Multisig } from "../typechain";
import { getContractAddress, getSignerWallet, requestCreateTxInputs } from "../lib";
const MultisigContract = require("../artifacts/contracts/Multisig.sol/Multisig.json");

let TO_ADDRESS = '';
let ETHER_VALUE = '0';
let DATA = '0x';

async function main() {
  const contractAddress = getContractAddress();
  const signer = getSignerWallet();

  const contract = (new ethers.Contract(contractAddress, MultisigContract.abi, signer)) as Multisig;
  contract.on("TransactionCreated", (ev) => {
    console.log('===== TransactionCreated event emmited =====');
    console.log(ev);
  });

  if (TO_ADDRESS === '') {
    ({ TO_ADDRESS, ETHER_VALUE, DATA } = await requestCreateTxInputs());
  }

  console.log('creating transaction...');
  // TODO -> wait for tx confirmation by miners?
  await contract.createTransaction(TO_ADDRESS, ethers.utils.parseEther(ETHER_VALUE), DATA);
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

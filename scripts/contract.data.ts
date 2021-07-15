import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";
import { MockMultisig } from "../typechain";
import { getContractAddress } from "../lib/get-contract";
const MultisigContract = require("../artifacts/contracts/Multisig.sol/Multisig.json");


async function main() {
  const contractAddress = getContractAddress();
  const contract = (new ethers.Contract(contractAddress, MultisigContract.abi, ethers.provider)) as MockMultisig;

  const minNumOfSignatures = await contract.minNumOfSignatures();
  console.log(`minimum number of tx signatures:`, minNumOfSignatures);

  const numOfTransactions = await contract.getTransactionsLength();
  for (let i = 0; i < numOfTransactions.toNumber(); i++) {
    const transaction = await contract.transactions(BigNumber.from(i));
    console.log(`transaction id:${i}`, transaction);
  }

  const balance = await ethers.provider.getBalance(contractAddress);
  console.log("contract balance:", ethers.utils.formatEther(balance));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

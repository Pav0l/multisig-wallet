import { ethers } from "hardhat";
import { Multisig } from "../typechain";
import { getContractAddress, getOwnersWallets, requestMinNumOfSignatures } from "../lib";
const MultisigContract = require("../artifacts/contracts/Multisig.sol/Multisig.json");

const OWNER_ID = 1;
let NEW_SIG_REQUIREMENT = 0;

async function main() {
  const contractAddress = getContractAddress();
  const owners = getOwnersWallets();
  const signer = owners[OWNER_ID];

  const contract = (new ethers.Contract(contractAddress, MultisigContract.abi, signer)) as Multisig;

  if (NEW_SIG_REQUIREMENT === 0) {
    ({ NEW_SIG_REQUIREMENT } = await requestMinNumOfSignatures());
  }

  console.log('changing signature requirement...');

  const tx = await contract.changeSignatureRequirement(NEW_SIG_REQUIREMENT);
  console.log('DONE!', tx);
  const receipt = await tx.wait();
  console.log('receipt:', receipt);
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

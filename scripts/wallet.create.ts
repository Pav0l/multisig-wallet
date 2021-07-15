import { ethers } from "hardhat";

async function main() {
  const wallet = ethers.Wallet.createRandom();

  console.log({
    "address": wallet.address,
    "mnemonic": wallet.mnemonic,
    "private_key": wallet.privateKey
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

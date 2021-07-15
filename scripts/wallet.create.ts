import { ethers } from "hardhat";

async function main() {
  const wallet = ethers.Wallet.createRandom();

  console.log("wallet address", wallet.address);
  console.log("wallet mnemonic", wallet.mnemonic);
  console.log("wallet private key", wallet.privateKey);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

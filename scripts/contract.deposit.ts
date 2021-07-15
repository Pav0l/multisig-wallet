import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";
import { getContractAddress } from "../lib/get-contract";
import { getSignerWallet } from "../lib/get-signer-wallet";

const ETHER_VALUE = "150";


async function main() {
  const contractAddress = getContractAddress();
  const wallet = getSignerWallet();

  await wallet.sendTransaction({
    to: contractAddress,
    value: ethers.utils.parseEther(ETHER_VALUE),
    gasLimit: BigNumber.from(42000)
  });

  const contractBalance = await ethers.provider.getBalance(contractAddress);
  const walletBalance = await ethers.provider.getBalance(wallet.address);
  console.log("wallet balance:", ethers.utils.formatEther(walletBalance));
  console.log("contract balance:", ethers.utils.formatEther(contractBalance));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

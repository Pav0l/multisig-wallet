import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";
import { getContractAddress } from "../lib/get-contract";
import { getSignerWallet } from "../lib/get-signer-wallet";

const ETHER_VALUE = "0.1";


async function main() {
  const contractAddress = getContractAddress();
  const wallet = getSignerWallet();

  console.log(`Sending ${ETHER_VALUE}ETH to contract at: ${contractAddress}`);

  const tx = await wallet.sendTransaction({
    to: contractAddress,
    value: ethers.utils.parseEther(ETHER_VALUE),
    gasLimit: BigNumber.from(42000)
  });
  await tx.wait();

  console.log(`done! check transaction details for:${tx.hash}`);

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

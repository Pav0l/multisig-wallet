import { ethers } from "hardhat";
import { getOwnersWallets } from "../lib/";

const owners = getOwnersWallets();
const TO_ADDRESS = owners[2].address;
const ETHER_VALUE = "0.2";

async function main() {
  const wallet = owners[0];

  console.log(`Sending transaction from ${wallet.address} to ${TO_ADDRESS} with value: ${ETHER_VALUE}`)

  const tx = await wallet.sendTransaction({
    to: TO_ADDRESS,
    value: ethers.utils.parseEther(ETHER_VALUE)
  });

  console.log("transaction pending:", tx.hash);
  tx.wait();
  console.log("done!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

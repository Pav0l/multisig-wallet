import { ethers } from "hardhat";
import { getOwnersWallets } from "../lib/";

const owners = getOwnersWallets();
const TO_ADDRESS = owners[1].address;
const ETHER_VALUE = "500";

async function main() {
  const wallet = owners[0];

  console.log(`Sending transaction from ${wallet.address} to ${TO_ADDRESS} with value: ${ETHER_VALUE}`)

  const tx = await wallet.sendTransaction({
    to: TO_ADDRESS,
    value: ethers.utils.parseEther(ETHER_VALUE)
  });

  console.log("transaction:", tx);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

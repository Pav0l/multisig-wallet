import { ethers, network } from "hardhat";
import { writeFileSync } from "fs";
import deployments from '../deployment.json'
import { getOwnersWallets, DEPLOYMENT_FILE_PATH } from "../lib";

const MIN_NUM_OF_TX_SIGNATURES = 2;


async function main() {
  const ownersWallets = getOwnersWallets();
  const signer = ownersWallets[0];

  console.log(`Deploying Multisig contract from address`, signer.address);
  const MultisigFactory = await ethers.getContractFactory("Multisig", signer);

  const owners = ownersWallets.map(o => {
    return { address: o.address, mnemonic: o.mnemonic };
  });
  const ownersAddresses = owners.map(owner => owner.address);

  console.log(`Multisig contract requires ${MIN_NUM_OF_TX_SIGNATURES} signatures for transaction`);
  console.log("Owners able to sign a transaction", owners);
  const contract = await MultisigFactory.deploy(MIN_NUM_OF_TX_SIGNATURES, ownersAddresses);

  console.log("Waiting for the contract to be deployed...");
  await contract.deployed();
  console.log("Multisig contract deployed to:", contract.address);

  const provider = network.name;

  console.log(`Savig deployment to: ${DEPLOYMENT_FILE_PATH} for provider network: ${provider}`);
  console.log("Previous deployment.json", JSON.stringify(deployments, null, 2));

  const data = JSON.stringify({
    ...deployments,
    [provider]: {
      address: contract.address,
      owners: owners
    },
  }, null, 2);

  writeFileSync(DEPLOYMENT_FILE_PATH, data);
  console.log("Current deployment.json", data);

}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

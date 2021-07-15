import { ethers, network } from "hardhat";
import { writeFileSync } from "fs";

import deployments from '../deployment.json'
import { getSignerWallet, requestDeployInputs, DEPLOYMENT_FILE_PATH, ETHERSCAN_ARGS_FILE_PATH } from "../lib";

// you can setup deploy inputs here, or via CLI
let MIN_NUM_OF_TX_SIGNATURES = 0;
let OWNER_ADDRESSES: string[] = [];

async function main() {
  const signer = getSignerWallet();

  console.log(`Deploying Multisig contract from address`, signer.address);
  const MultisigFactory = await ethers.getContractFactory("Multisig", signer);

  if (!MIN_NUM_OF_TX_SIGNATURES || OWNER_ADDRESSES.length === 0) {
    ({ MIN_NUM_OF_TX_SIGNATURES, OWNER_ADDRESSES } = await requestDeployInputs());
  }

  const contract = await MultisigFactory.deploy(MIN_NUM_OF_TX_SIGNATURES, OWNER_ADDRESSES);

  console.log(`Waiting for the contract to be deployed...`);
  console.log(`Check progress on EtherScan by searching: ${contract.address}`)
  await contract.deployed();
  console.log("Multisig contract deployed to:", contract.address);
  console.log("Updating deployment file and etherscan args file...");

  const ownersToStore = OWNER_ADDRESSES.map(o => ({ address: o }));
  const provider = network.name;

  const data = JSON.stringify({
    ...deployments,
    [provider]: {
      address: contract.address,
      owners: ownersToStore
    },
  }, null, 2);

  writeFileSync(DEPLOYMENT_FILE_PATH, data);

  const etherscanArgs = `module.exports = [
    ${MIN_NUM_OF_TX_SIGNATURES},
    ${JSON.stringify(OWNER_ADDRESSES)}
  ];`

  writeFileSync(ETHERSCAN_ARGS_FILE_PATH, etherscanArgs);

  console.log("Don't forget to update npm scripts & docs with new contract address");
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

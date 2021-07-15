import { network } from "hardhat";

import deployment from "../deployment.json";

export function getContractAddress(): string {
  const networkName = network.name;
  if (!(networkName in deployment)) throw new Error(`${networkName} is missing in development.json`);


  const address = (deployment as any)[networkName].address;
  if (!address) throw new Error(`Missing contract deployment address for ${networkName}`);

  return address;
}

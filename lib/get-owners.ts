import { network } from "hardhat";
import { Mnemonic } from "ethers/lib/utils";
import ownersJson from "../owners.json";

/**
 * @returns addresses of contract owners eligible to sign transactions
 */
export function getOwners(): { address: string, mnemonic: Mnemonic }[] {
  const networkName = network.name;
  if (!(networkName in ownersJson)) throw new Error(`${networkName} is missing in owners.json`);

  const owners = (ownersJson as any)[networkName].owners;
  if (!owners) throw new Error("Missing `owners` in owners.json");

  // TODO: @palo - typecheck owners
  return owners;
}

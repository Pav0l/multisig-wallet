import { ethers } from "hardhat";
import { Wallet } from "ethers/src.ts/ethers";
import { getOwners } from "./get-owners";

export function getOwnersWallets(): Wallet[] {
  const owners = getOwners();
  const ownersWallets = [];
  for (let i = 0; i < owners.length; i++) {
    const key = ethers.Wallet.fromMnemonic(owners[i].mnemonic.phrase);
    const wallet = new ethers.Wallet(key, ethers.provider);
    ownersWallets.push(wallet);
  }
  return ownersWallets;
}



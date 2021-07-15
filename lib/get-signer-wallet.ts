import { Wallet } from "@ethersproject/wallet";
import { ethers, network } from "hardhat";
import { HardhatNetworkHDAccountsConfig } from "hardhat/types";

export function getSignerWallet(): Wallet {
  let key;
  switch (network.name) {
    case 'ropsten':
      key = process.env['ROPSTEN_PRIVATE_KEY'];
    case 'hardhat':
    case 'localhost':
      key = ethers.Wallet.fromMnemonic((network.config.accounts as HardhatNetworkHDAccountsConfig).mnemonic);      
  }

  if (!key) throw new Error(`Missing key for '${network.name}' network in env`);

  return new ethers.Wallet(key, ethers.provider);
}
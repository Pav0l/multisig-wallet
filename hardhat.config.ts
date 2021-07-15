import "dotenv/config";
import "@typechain/hardhat"
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "@tenderly/hardhat-tenderly";
import "hardhat-docgen";
import { task } from "hardhat/config";
import { HardhatUserConfig } from "hardhat/config";
import { setupWallet } from "./lib/setup-wallet";

task("wallet:setup", "Create new Wallet for multisig contract and deposit some Ether")
  .addParam("count", "number of wallets you want to setup", "1")
  .addParam("eth", "the ammount of ETH to sent to wallet", "100")
  .setAction(async (args, hre) => {
    await setupWallet(args, hre);
  });


task("wallet:balance", "Prints Wallets balance in ETH")
  .addPositionalParam("wallet", "The wallet's address")
  .setAction(async (args, hre) => {
    const balance = await hre.ethers.provider.getBalance(args.wallet);
    console.log(hre.ethers.utils.formatEther(balance), "ETH");
  });


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
      mining: { auto: true, interval: 0 },
      accounts: {
        initialIndex: 0,
        count: 5,
        path: "m/44'/60'/0'/0",
        mnemonic: "test test test test test test test test test test test junk",
        accountsBalance: "100000000000000000000"
      },

    },
    hardhat: {
      allowUnlimitedContractSize: true
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env["INFURA_PROJECT_ID"]}`,
      accounts: {
        mnemonic: process.env["ROPSTEN_MNEMONIC"],
        path: process.env["ROPSTEN_MNEMONIC_PATH"]
      }
    }
  },
  etherscan: {
    apiKey: process.env["ETHERSCAN_API_KEY"]
  },
  tenderly: {
    project: "project",
    username: "palo"
  },
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: false
  }
}

export default config;

# Multisig wallet

v1 of the contract deployed to Ropsten network at: [0xefFFC131E490494cce8666e8663C5B6C106B9B99](https://ropsten.etherscan.io/address/0xefFFC131E490494cce8666e8663C5B6C106B9B99).

**Wallet specification:**

- ability to specify number of signatures required to sign a transaction (must be higher than 1)
- ability to specify list of owners of the wallet (num of owners be equal or higher than num of signatures required for tx)
- every transaction sent from the wallet must be signed by at least the num of signatures required

# Project setup

To setup the project on localhost network, run the following commands:

- run `npm install`
- run `cp .env.sample .env` and fill in ENV values
- run `npm run start`
- run `npm run wallet:setup:localhost` to setup owners of the contract  
  _OPTIONS:_

  - `--count` defines the number of wallets you want to setup. defaults to `1`.
  - `--eth` defines the amount of Ether that will be sent to the wallet. defaults to `100`.

  ```
  npm run wallet:setup:localhost -- --count 3 --eth 10
  ```

- run `npm run deploy:localhost`  
  _NOTE: There are two scripts to deploy the contract: `deploy.ts` and `dev.deploy.ts`. The first one is ment to be used with Testnets/Mainnet. The second one is targeted for deployment on localhost/hardhat network._

Now the contract is deployed on your localhost network for testing/development.

If you want to deploy the contract to other networks (Hardhat/Testnets/Mainnet) modify the scripts with proper `--network` parameter.
For example:

```
npx hardhat run ./scripts/deploy.ts --network ropsten
```

## Interacting with the contract

See scripts in `package.json` or scripts in `./scripts/` folder.

- `create:localhost` creates a new transaction in the contract for confirmation by other owners
- `confirm:localhost` confirms a transaction in the contract
- `revoke:localhost` revokes a confirmation of a transaction
- `execute:localhost` executes a transaction

## Running tests

```
npm run test
```

---

# TODO:

- implement the ability to change owners of the contract
- who can authorize new owner or remove existing owner?
  - should be the same mechanism as when confirming/executing transaction
- when removing owner
  - check if we will have enough minNumOfSignatures
- when adding owner,
  - check if already exists
  - check if not null address
- should we specify max num of owners?

New functions:

- addOwner
- removeOwner
- updateOwner (replace existing owner with new one)

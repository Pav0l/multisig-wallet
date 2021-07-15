import prompts from "prompts";

export async function requestDeployInputs() {
  const { OWNER_ADDRESSES }: { OWNER_ADDRESSES: string[] } = await prompts({
    type: 'list',
    name: 'OWNER_ADDRESSES',
    message: 'Enter comma separated list of Multisig Wallet addresses',
    initial: '',
    separator: ','
  });

  console.log('Please confirm owner addresses:')
  for (const address of OWNER_ADDRESSES) {
    const res = await prompts({
      type: 'confirm',
      name: `${address}`,
      message: `Are you sure you want ${address} as contract owner?`,
      initial: true
    });

    if (!res[address]) {
      throw new Error(`Address ${address} was not confirmed as contract owner. Please start again.`);
    }
  }


  const { MIN_NUM_OF_TX_SIGNATURES }: { MIN_NUM_OF_TX_SIGNATURES: number } = await prompts({
    type: 'number',
    name: 'MIN_NUM_OF_TX_SIGNATURES',
    message: 'What is the required number of confirmations for a transaction?',
    initial: 2,
    style: 'default',
    min: 2,
    validate: (value: number) => {
      if (OWNER_ADDRESSES.length >= value) {
        return true;
      } else {
        return 'Number or transaction confirmations must be equal or less than number of owners';
      }
    },
  });

  return { OWNER_ADDRESSES, MIN_NUM_OF_TX_SIGNATURES };
}

export async function requestCreateTxInputs() {
  const { TO_ADDRESS }: { TO_ADDRESS: string } = await prompts({
    type: 'text',
    name: 'TO_ADDRESS',
    message: 'Enter address where to send the transaction:'
  });

  const { ETHER_VALUE }: { ETHER_VALUE: number } = await prompts({
    type: 'number',
    name: 'ETHER_VALUE',
    message: 'Enter amount of ETH to send:',
    initial: 0,
    style: 'default',
    min: 0,
    float: true
  });

  const { DATA }: { DATA: string } = await prompts({
    type: 'text',
    name: 'DATA',
    message: 'Enter transaction data:',
    initial: '0x'
  });

  return { TO_ADDRESS, ETHER_VALUE: ETHER_VALUE.toString(), DATA };
}

export async function requestTxId() {
  const { TRANSACTION_ID }: { TRANSACTION_ID: number } = await prompts({
    type: 'number',
    name: 'TRANSACTION_ID',
    message: 'Enter transaction id:',
    style: 'default',
    initial: 0,
    min: 0,
    float: false
  });

  return { TRANSACTION_ID };
}


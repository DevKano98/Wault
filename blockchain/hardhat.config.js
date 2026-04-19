require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config({ path: '../.env' });

function getAccounts() {
  const privateKey = process.env.PRIVATE_KEY || '';
  const normalizedKey = privateKey.startsWith('0x')
    ? privateKey
    : `0x${privateKey}`;

  if (/^0x[a-fA-F0-9]{64}$/.test(normalizedKey)) {
    return [normalizedKey];
  }

  return [];
}

const accounts = getAccounts();

module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    mumbai: {
      url: process.env.POLYGON_RPC_URL,
      accounts,
      chainId: 80001,
    },
    polygon: {
      url: 'https://polygon-rpc.com',
      accounts,
      chainId: 137,
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || '',
    },
  },
};

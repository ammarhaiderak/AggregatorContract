require('dotenv').config()
require("@nomicfoundation/hardhat-toolbox");


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.12',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      throwOnTransactionFailures: true,
      loggingEnabled: true,
      forking: {
        url: 'https://rpc.ankr.com/eth',
        enabled: true
      },
    },
    forked: {
      url: 'http://127.0.0.1:8545/',
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
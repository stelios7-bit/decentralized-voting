require('@nomicfoundation/hardhat-toolbox')
require('hardhat-deploy')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    // local Hardhat node: `npm run node`
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
  },
}

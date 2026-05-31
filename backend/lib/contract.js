const fs = require('fs')
const path = require('path')
const { Web3 } = require('web3')
const config = require('../config')

const web3 = new Web3(config.rpcUrl)

// shared/Voting.json is written by the deploy script (deploy/01_deploy_voting.js)
const DEPLOYMENT_PATH = path.join(__dirname, '..', '..', 'shared', 'Voting.json')

let contract = null
let address = null

function load() {
  if (!fs.existsSync(DEPLOYMENT_PATH)) {
    throw new Error(
      'shared/Voting.json not found — deploy the contract first (npm run deploy:localhost)'
    )
  }
  const { address: addr, abi } = JSON.parse(
    fs.readFileSync(DEPLOYMENT_PATH, 'utf8')
  )
  address = addr
  contract = new web3.eth.Contract(abi, addr)
}

/** Lazily build (and cache) the web3 contract instance. */
function getContract() {
  if (!contract) load()
  return contract
}

function getAddress() {
  if (!address) load()
  return address
}

/** The contract's owner account — the deployer / first node account. */
async function getOwnerAccount() {
  return getContract().methods.owner().call()
}

module.exports = { web3, getContract, getAddress, getOwnerAccount }

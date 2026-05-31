const fs = require('fs')
const path = require('path')

/**
 * Deploys the Voting contract and exports its ABI + address to
 * `shared/Voting.json` so the Node.js backend can consume it without
 * reaching into Hardhat internals.
 */
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  const voting = await deploy('Voting', {
    from: deployer,
    args: [],
    log: true,
  })

  // Export a clean { address, abi } artifact for the backend.
  const artifact = await deployments.getArtifact('Voting')
  const out = { address: voting.address, abi: artifact.abi }
  const dir = path.join(__dirname, '..', 'shared')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    path.join(dir, 'Voting.json'),
    JSON.stringify(out, null, 2)
  )

  log(`Voting deployed at ${voting.address}`)
  log(`ABI + address exported to shared/Voting.json`)
}

module.exports.tags = ['Voting']

const express = require('express')
const config = require('./config')
const logger = require('./middleware/logger')
const { notFound, errorHandler } = require('./middleware/error')
const { web3, getAddress } = require('./lib/contract')

const app = express()

app.use(express.json())
app.use(logger)

// Health check — reports chain connectivity and the bound contract address.
app.get('/health', async (req, res) => {
  let chainId = null
  let contract = null
  try {
    chainId = Number(await web3.eth.getChainId())
  } catch {
    // RPC not reachable — reported as null below
  }
  try {
    contract = getAddress()
  } catch {
    // deployment artifact missing — reported as null below
  }
  res.json({
    status: chainId !== null ? 'ok' : 'degraded',
    chainId,
    contract,
  })
})

// Contract routes are mounted in a later change.

app.use(notFound)
app.use(errorHandler)

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Voting backend listening on http://localhost:${config.port}`)
  })
}

module.exports = app

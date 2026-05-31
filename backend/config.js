require('dotenv').config()

module.exports = {
  port: process.env.PORT || 3000,
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
}

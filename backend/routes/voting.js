const router = require('express').Router()
const asyncHandler = require('../utils/asyncHandler')
const asContractError = require('../utils/contractError')
const { requireFields } = require('../middleware/validate')
const { getContract } = require('../lib/contract')

// POST /vote { address, candidateIndex } — cast one vote from `address`
router.post(
  '/vote',
  requireFields('address', 'candidateIndex'),
  asyncHandler(async (req, res) => {
    const { address, candidateIndex } = req.body
    try {
      const receipt = await getContract()
        .methods.vote(Number(candidateIndex))
        .send({ from: address })
      res.json({
        voter: address,
        candidateIndex: Number(candidateIndex),
        txHash: receipt.transactionHash,
      })
    } catch (err) {
      throw asContractError(err)
    }
  })
)

// GET /winner — name of the leading candidate
router.get(
  '/winner',
  asyncHandler(async (req, res) => {
    try {
      const winner = await getContract().methods.getWinner().call()
      res.json({ winner })
    } catch (err) {
      throw asContractError(err)
    }
  })
)

module.exports = router

const router = require('express').Router()
const asyncHandler = require('../utils/asyncHandler')
const asContractError = require('../utils/contractError')
const { requireFields } = require('../middleware/validate')
const { getContract, getOwnerAccount } = require('../lib/contract')

// GET /candidates — list every candidate with its vote count
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const list = await getContract().methods.getCandidates().call()
    res.json(
      list.map((c, index) => ({
        index,
        name: c.name,
        voteCount: Number(c.voteCount),
      }))
    )
  })
)

// POST /candidates { name } — owner account only
router.post(
  '/',
  requireFields('name'),
  asyncHandler(async (req, res) => {
    const { name } = req.body
    const owner = await getOwnerAccount()
    try {
      const receipt = await getContract()
        .methods.addCandidate(name)
        .send({ from: owner })
      res.status(201).json({ name, txHash: receipt.transactionHash })
    } catch (err) {
      throw asContractError(err)
    }
  })
)

module.exports = router

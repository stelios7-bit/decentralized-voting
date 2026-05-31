/**
 * Normalise a web3 contract/transaction error into a clean 400 error.
 * Pulls out the revert reason / custom error name where web3 exposes it.
 */
module.exports = function asContractError(err) {
  const raw =
    err?.innerError?.message ||
    err?.cause?.message ||
    err?.reason ||
    err?.message ||
    'transaction reverted'

  // surface a custom-error name when present: "...custom error 'AlreadyVoted()'"
  const m = raw.match(/custom error '([^']+)'/)
  const message = m ? m[1] : raw

  const e = new Error(message)
  e.status = 400
  return e
}

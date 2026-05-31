/**
 * Returns middleware that rejects the request (400) unless every named field
 * is present and non-empty in the JSON body.
 */
function requireFields(...fields) {
  return (req, res, next) => {
    const body = req.body || {}
    const missing = fields.filter(
      (f) => body[f] === undefined || body[f] === null || body[f] === ''
    )
    if (missing.length) {
      const err = new Error(`Missing required field(s): ${missing.join(', ')}`)
      err.status = 400
      return next(err)
    }
    next()
  }
}

module.exports = { requireFields }

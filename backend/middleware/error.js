/** 404 handler for unmatched routes. */
function notFound(req, res) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` })
}

/** Central error handler — returns clean JSON, logs the cause. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500
  console.error(`Error [${status}]: ${err.message}`)
  res.status(status).json({ error: err.message || 'Internal server error' })
}

module.exports = { notFound, errorHandler }

function log(...data) {
  console.info('[WikiForum] [INFO]', ...data)
}

function warn(...data) {
  console.warn('[WikiForum] [WARN]', ...data)
}

function error(...data) {
  console.error('[WikiForum] [ERR]', ...data)
}

module.exports = {
  log,
  info: log,
  warn,
  error,
  err: error,
}

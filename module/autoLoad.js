const loadPage = require('./loadPage')
const log = require('./log')
const { conf } = require('./mw')

module.exports = () => {
  var ns = window.WikiForum.ns || []
  if (ns.includes(conf.wgNamespaceNumber)) {
    log.info('Is Forum NS')
    loadPage(conf.wgPageName)
  } else {
    log.info('Not Forum NS')
  }
}

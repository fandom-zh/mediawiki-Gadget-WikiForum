const { apiParser } = require('./parser')
const getSource = require('./getSource')
const { util } = require('./mw')
const log = require('./log')

module.exports = (page = util.wgPageName) => {
  log.info('Strat to load page data', page)
  getSource(page).then(
    data => {
      log.info('Page data ready', page)
      var Obj = apiParser(data)
      var ret = {}
      ret[page] = Obj
      mw.hook('WikiForum.render').fire(ret)
    },
    err => {
      log.err('Failed to load page data', err)
    }
  )
}

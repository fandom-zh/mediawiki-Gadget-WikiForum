const { api, conf } = require('./mw')

module.exports = (page = conf.wgPageName) => {
  return $.get(api, {
    format: 'json',
    action: 'parse',
    prop: 'text|wikitext',
    page,
  })
}

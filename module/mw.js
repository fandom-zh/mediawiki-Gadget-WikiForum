module.exports = {
  api: mw.util.wikiScript('api'),
  conf: mw.config.get(),
  editToken: mw.user.tokens.get('csrfToken'),
  hook: mw.hook,
  util: mw.util,
}

mw.hook('WikiForum').add(function(Core) {
  var loadNS = window.WikiForumNS || []

  if (typeof loadNS === 'number') loadNS = [loadNS]

  var conf = mw.config.get()
  if (
    loadNS.includes(conf.wgNamespaceNumber) &&
    $('.wiki-forum').length > 0 &&
    conf.wgArticleId !== 0
  ) {
    Core.renderer.fromPage(conf.wgPageName)
  }
})

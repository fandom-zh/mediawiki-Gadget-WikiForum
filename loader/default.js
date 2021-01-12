mw.hook('WikiForum').add(function(Core) {
  var conf = mw.config.get()
  const settings = window.WikiForumLoaderDefault || {}

  var loadNS = settings.loadNS || window.WikiForumNS || []

  if (typeof loadNS === 'string') {
    loadNS = Number(loadNS)
    if (isNaN(loadNS)) {
      loadNS = []
    } else {
      loadNS = [loadNS]
    }
  }

  if (typeof loadNS === 'number') loadNS = [loadNS]

  if (loadNS.length < 1 && conf.wgNamespaceIds.forum)
    loadNS = [conf.wgNamespaceIds.forum]

  if (
    loadNS.includes(conf.wgNamespaceNumber) &&
    $('.wiki-forum').length > 0 &&
    conf.wgArticleId !== 0
  ) {
    Core.renderer.fromPage(conf.wgPageName)
  }
})

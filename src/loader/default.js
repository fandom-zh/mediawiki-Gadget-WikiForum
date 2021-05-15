mw.hook('WikiForum').add(function(Core) {
  const conf = mw.config.get()
  const settings = window.WikiForumLoaderDefault || {}

  let loadNS = settings.loadNS || window.WikiForumNS || []

  if (typeof loadNS === 'number') loadNS = [loadNS]

  if (loadNS.length < 1 && conf.wgNamespaceIds.forum)
    loadNS = [conf.wgNamespaceIds.forum]

  if (
    loadNS.includes(conf.wgNamespaceNumber) &&
    // $('.wiki-forum').length > 0 &&
    conf.wgArticleId !== 0 &&
    conf.wgAction === 'view'
  ) {
    Core.renderer.fromPage(conf.wgPageName)
  }
})

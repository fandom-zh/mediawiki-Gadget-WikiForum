/**
 * @function theme.default 标准的官方主题
 * @param {Object} ctx
 * @param {Object} ctx.meta Metadata
 *
 * @param {Function} next
 */
mw.hook('WikiForum.theme').add(next => {
  // 全论坛容器
  var allForumsContainer = ctx => {
    return $('<div>', { class: 'wiki-forum-all-container' }).append(
      newForumContainer()
    )
  }

  // 单论坛容器
  var forumContainer = ctx => {
    return $('<div>', {
      class: 'wiki-forum',
      'data-forumid': ctx.meta.id,
    }).append(newThreadContainer())
  }

  // 帖子容器
  var threadContainer = ctx => {
    // 处理 meta
    const id = String(ctx.meta.id)
    const content = cxt.content
    const timePublish =
      ctx.meta.timePublish || ctx.meta.timeRelease || ctx.meta.release || ''
    const timeModify = ctx.meta.timeModify || timePublish
    const userAuthor = ctx.meta.userAuthor || ctx.meta.user || 'unsigned'
    const userLast = ctx.meta.userLast || userAuthor

    // 缓存组件
    var $idLink = $('<span>', { class: 'forum-id-link', text: '#' + id })
    var $userLink = $('<div>', { class: 'forum-user' }).append(
      $('<span>', { class: 'forum-user-link' }).append(
        $('<a>', {
          class: 'mw-userlink userAuthor',
          text: userAuthor,
          href: mw.util.getUrl('User:' + userAuthor),
        })
      )
    )
    var $content = $('<div>', { class: 'forum-content', html: content })
    var $timeArea = $('<div>', { class: 'post-time' }).append(
      $('<i>', {
        class: 'post-date timePublish',
        text: new Date(timePublish).toLocaleString(),
      })
    )

    // 楼主
    var $firstThread = $('<div>', { class: 'forum-thread forum-first' }).append(
      $('<div>', { class: 'forum-before' }).append(
        $('<h3>', { class: 'forum-title', text: ctx.meta.title }),
        $idLink,
        $userLink
      ),
      $content,
      $('<div>', { class: 'forum-after' }).append($timeArea)
    )

    // 普通帖子
    var $normalThread = $('<div>', { class: 'forum-thread' }).append(
      $('<div>', { class: 'forum-before' }).append($idLink, $userLink),
      $content,
      $('<div>', { class: 'forum-after' }).append(
        $timeArea,
        newReplyContainer()
      )
    )

    // 判断是否为楼主，并返回帖子容器
    if (id === '1') {
      return $firstThread
    } else {
      return $normalThread
    }
  }

  // 新回复容器
  var newReplyContainer = ctx => {
    return $('<div>').append($('<p>', { text: 'newReplyContainer' }))
  }

  // 新帖子容器
  var newThreadContainer = ctx => {
    return $('<div>').append($('<p>', { text: 'newThreadContainer' }))
  }

  // 新论坛容器
  var newForumContainer = ctx => {
    return $('<div>').append($('<p>', { text: 'newForumContainer' }))
  }

  // 无论坛容器
  var noForumContainer = ctx => {}

  next &&
    next({
      allForumsContainer,
      forumContainer,
      threadContainer,
    })
})

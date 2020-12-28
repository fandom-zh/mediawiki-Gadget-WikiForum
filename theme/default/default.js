/**
 * @function theme.default 标准的官方主题
 * @param {Object} ctx
 * @param {jQuery<Element>} ctx.fn.newThreadArea
 * @param {jQuery<Element>} ctx.fn.newReplyArea
 * @param {Object} ctx.meta
 *
 * @param {Function} next
 */
mw.hook('WikiForum.theme').add(next => {
  var allForumsContainer = ctx => {
    return $('<div>', { class: 'wiki-forum-all-container' })
  }

  var forumContainer = ctx => {
    return $('<div>', { class: 'wiki-forum', 'data-forumid': ctx.meta.id })
  }

  var firstThread = ctx => {
    return $('<div>', { class: 'forum-thread forum-first' }).append(
      $('<div>', { class: 'forum-before' }).append(
        $('<h3>', { class: 'forum-title', text: ctx.meta.title }),
        $('<span>', { class: 'forum-id-link', text: '#' + ctx.meta.id }),
        $('<div>', { class: 'forum-user' }).append(
          $('<span>', { class: 'forum-user-link' }).append(
            $('<a>', {
              text: ctx.meta.userAuthor,
              href: mw.util.getUrl('User:' + ctx.meta.userAuthor),
            })
          )
        )
      ),
      $('<div>', { class: 'forum-content', html: ctx.content }),
      $('<div>', { class: 'forum-after' }).append(
        $('<i>', {
          class: 'post-date',
          text: new Date(ctx.meta.timePublish).toLocaleString(),
        })
      ),
      ctx.fn.newThreadArea
    )
  }

  var normalThread = ctx => {
    return $('<div>', { class: 'forum-thread' }).append(
      $('<div>', { class: 'forum-before' }).append(
        $('<div>', { class: 'forum-user' }).append(
          $('<span>', { class: 'forum-user-link' }).append(
            $('<a>', {
              text: ctx.meta.userAuthor,
              href: mw.util.getUrl('User:' + ctx.meta.userAuthor),
            })
          )
        )
      ),
      $('<div>', { class: 'forum-content', html: ctx.content }),
      $('<div>', { class: 'forum-after' }).append(
        $('<i>', {
          class: 'post-date',
          text: new Date(ctx.meta.timePublish).toLocaleString(),
        }),
        ctx.fn.newReplyArea
      )
    )
  }

  next &&
    next({
      allForumsContainer,
      forumContainer,
      // beforeForum,
      firstThread,
      normalThread,
      // afterForum,
    })
})

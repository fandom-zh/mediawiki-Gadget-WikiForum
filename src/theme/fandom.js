// Theme settings
// const settings = $.extend(
//   {},
//   {
//     adminGroup: ['sysop'],
//     adminUser: [],
//     depthMax: 3,
//     enableNewForum: false,
//     enableModify: true,
//     enableDelete: true,
//   },
//   window.WikiForumDefaultTheme
// )

// Import style
require('./default.styl')

// Wait i18n-js
// eslint-disable-next-line no-undef
importArticle({
  type: 'script',
  article: 'u:dev:MediaWiki:I18n-js/code.js',
})
mw.hook('dev.i18n').add(function(i18no) {
  i18no.loadMessages('WikiForum-theme-default').then(main)
})

// function main
function main(i18n) {
  /**
   * @function theme.default 标准的官方主题
   * @param {Object} ctx
   * @param {Object} ctx.meta Metadata
   *
   * @param {Function} next
   */
  mw.hook('WikiForum.theme').add((next) => {
    function _msg(...params) {
      return i18n.msg(...params).parse()
    }

    const conf = mw.config.get()

    // 全论坛容器
    var allForumsContainer = () => {
      return $('<div>', { class: 'wiki-forum-all-container' })
    }

    // 单论坛容器
    var forumContainer = (ctx) => {
      return $('<div>', {
        class: 'wiki-forum',
        'data-forumid': ctx.meta.id,
      })
    }

    // 帖子容器
    var threadContainer = (ctx) => {
      // 处理 meta
      const { forumid, threadid, content } = ctx
      const timePublish =
        ctx.meta.timePublish || ctx.meta.timeRelease || ctx.meta.release || ''
      // const timeModify = ctx.meta.timeModify || timePublish
      const userAuthor = ctx.meta.userAuthor || ctx.meta.user || 'unsigned'
      const userLast = ctx.meta.userLast || userAuthor
      const htmlId = `forum-${forumid}_thread-${threadid}`

      // 缓存组件
      var $idLink = $('<a>', {
        class: 'forum-id-link',
        text: '#' + threadid,
        href: `#${htmlId}`,
      }).click(function(e) {
        e.preventDefault()
        window.history.pushState(null, null, '#' + htmlId)
        const $block = $('#' + htmlId)
        $('html,body').animate({ scrollTop: $block.offset().top - 100 }, 500)
      })
      var $userLink = $('<div>', { class: 'forum-user' }).append(
        $('<span>', { class: 'forum-user-link' }).append(
          $('<a>', {
            class: 'mw-userlink userAuthor',
            text: userAuthor,
            href: mw.util.getUrl('User:' + userAuthor),
          }),
          userLast === userAuthor
            ? ''
            : $('<i>', { text: ` (${_msg('user-last')}: ${userLast})` })
        )
      )
      var $content = $('<div>', { class: 'forum-content', html: content })
      var $timeArea = $('<div>', { class: 'post-time' }).append(
        $('<i>', {
          class: 'post-date timePublish',
          text: dateFormat(_msg('date-format'), new Date(timePublish)),
        })
      )

      // 判断是否为楼主，并返回帖子容器
      if (threadid === '1') {
        // 楼主
        return $('<div>', {
          id: htmlId,
          class: 'forum-thread forum-first',
        }).append(
          $('<div>', { class: 'forum-before' }).append(
            $('<h3>', {
              class: 'forum-title',
              text: ctx.forumMeta.title || '[UNTITLED] Forum Topic #' + forumid,
            }),
            $idLink,
            $userLink
          ),
          $content,
          $('<div>', { class: 'forum-after' }).append(
            $timeArea,
            reactionContainer(ctx)
          )
        )
      } else {
        // 普通帖子
        const { $root, $container, forumid, _forum, fn } = ctx
        var $replyArea = newReplyArea({
          $root,
          $container,
          forumEl: _forum,
          forumid,
          threadid,
          fn,
        })

        return $('<div>', { class: 'forum-thread', id: htmlId }).append(
          $('<div>', { class: 'forum-before' }).append($idLink, $userLink),
          $content,
          $('<div>', { class: 'forum-after' }).append(
            $timeArea,
            $('<div>', { class: 'new-reply-container' }).append(
              $('<div>', { class: 'modify-buttons-group' }).append(
                $('<a>', {
                  class: 'reply-btn',
                  href: 'javascript:;',
                  text: _msg('reply-btn'),
                }).click(function() {
                  $replyArea.show()
                  $(this).hide()
                })
              ),
              $replyArea
            ),
            reactionContainer(ctx)
          )
        )
      }
    }

    // 新回复容器
    var newReplyArea = (ctx) => {
      const { $root, forumEl, forumid, threadid } = ctx

      var $container = $('<div>', {
        class: 'forum-new-reply-area',
      })
      var $textArea = $('<textarea>', { class: 'forum-textarea' })
      var $submitBtn = $('<button>', {
        text: _msg('reply-btn'),
        class: 'forum-submit-btn',
      }).click(function() {
        var content = $textArea.val()
        if (!content) return

        $container.addClass('forum-loading')
        ctx.fn.updater.addReply({
          $root,
          forumEl,
          content,
          forumid,
          threadid,
        })
      })

      $container.append(
        $('<label>', { class: 'forum-input-container' }).append(
          $('<div>').append($textArea),
          $('<div>').append($submitBtn)
        )
      )

      return $container
    }

    // 新帖子容器
    var newThreadArea = (ctx) => {
      const { $root, _forum, forumid } = ctx

      var $container = $('<div>', {
        class: 'forum-new-thread-area',
      })
      var $textArea = $('<textarea>', { class: 'forum-textarea' })
      var $submitBtn = $('<button>', {
        text: _msg('submit-btn'),
        class: 'forum-submit-btn',
      }).click(function() {
        var content = $textArea.val()
        if (!content) return

        $container.addClass('forum-loading')
        ctx.fn.updater.addThread({ $root, forumEl: _forum, forumid, content })
      })

      $container.append(
        $('<strong>', { text: _msg('add-thread-label') }),
        $('<label>', { class: 'forum-input-container' }).append(
          $('<div>').append($textArea),
          $('<div>').append($submitBtn)
        )
      )

      return $container
    }

    // 点赞容器
    var reactionContainer = (ctx) => {
      const { _forum, forumid, threadid, meta, fn } = ctx

      const $container = $('<div>', { class: 'forum-reaction' })

      // Like btn
      let likeList = meta.reactionLike || ''
      if (likeList) {
        likeList = likeList.split('|')
      } else {
        likeList = []
      }
      let likeTotal = likeList.length
      let isLike = likeList.includes(conf.wgUserName)

      const $likeBtn = $('<a>', {
        href: 'javascript:;',
        class: 'reaction-like',
        text: `👍(${likeTotal})`,
        title: isLike
          ? _msg('reaction-like-remove')
          : _msg('reaction-like-add'),
      })
        .addClass(isLike ? 'is-like' : 'not-like')
        .click(function() {
          $container.addClass('forum-loading')
          if (isLike) {
            let index = likeList.indexOf(conf.wgUserName)
            if (index > -1) likeList.splice(index, 1)
          } else {
            likeList.push(conf.wgUserName)
          }
          likeList.sort()
          likeList = likeList.join('|')
          fn.updater.updateThread({
            forumEl: _forum,
            forumid,
            threadid,
            meta: { reactionLike: likeList },
          })
        })

      $container.append($likeBtn)

      return $container
    }

    // 新论坛容器
    var newForumContainer = () => {
      return $('<div>').append($('<p>', { text: 'newForumContainer' }))
    }

    // 无论坛容器
    var noForumContainer = () => {}

    var afterForum = (ctx) => {
      return $('<div>', { class: 'forum-thread forum-add-thread' }).append(
        newThreadArea(ctx)
      )
    }

    var afterAllForums = (ctx) => {
      return $('<div>', { class: 'after-all-forums' }).append(
        newForumContainer(ctx)
      )
    }

    // @function dateFormat
    function dateFormat(fmt, date) {
      date = date || new Date()
      var o = {
        'M+': date.getMonth() + 1, //月份
        'd+': date.getDate(), //日
        'h+': date.getHours(), //小时
        'm+': date.getMinutes(), //分
        's+': date.getSeconds(), //秒
        'q+': Math.floor((date.getMonth() + 3) / 3), //季度
        S: date.getMilliseconds(), //毫秒
      }
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + '').substr(4 - RegExp.$1.length)
        )
      }
      for (var k in o)
        if (new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ('00' + o[k]).substr(('' + o[k]).length)
          )
        }
      return fmt
    }

    next &&
      next({
        allForumsContainer,
        forumContainer,
        threadContainer,
        afterAllForums,
        afterForum,
        noForumContainer,
      })
  })
}

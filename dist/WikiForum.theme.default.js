/**
 * @name WikiForum.theme.default
 * @author 机智的小鱼君 <dragon-fish@qq.com>
 * @description Provide a front-end structured discussion page with JavaScript.
 *              Similar to Community Feed and support wikitext.
 *
 * @license MIT
 * @url https://github.com/Wjghj-Project/Gadget-WikiForum
 */

/******/ (function() { // webpackBootstrap
/*!**********************************!*\
  !*** ./theme/default/default.js ***!
  \**********************************/
/**
 * @function theme.default 标准的官方主题
 * @param {Object} ctx
 * @param {Object} ctx.meta Metadata
 *
 * @param {Function} next
 */
mw.hook('WikiForum.theme').add(function (next) {
  // 全论坛容器
  var allForumsContainer = function allForumsContainer(ctx) {
    return $('<div>', {
      "class": 'wiki-forum-all-container'
    }).append(newForumContainer());
  }; // 单论坛容器


  var forumContainer = function forumContainer(ctx) {
    return $('<div>', {
      "class": 'wiki-forum',
      'data-forumid': ctx.meta.id
    }).append(newThreadContainer());
  }; // 帖子容器


  var threadContainer = function threadContainer(ctx) {
    // 处理 meta
    var id = String(ctx.id);
    var content = cxt.content;
    var timePublish = ctx.meta.timePublish || ctx.meta.timeRelease || ctx.meta.release || '';
    var timeModify = ctx.meta.timeModify || timePublish;
    var userAuthor = ctx.meta.userAuthor || ctx.meta.user || 'unsigned';
    var userLast = ctx.meta.userLast || userAuthor; // 缓存组件

    var $idLink = $('<span>', {
      "class": 'forum-id-link',
      text: '#' + id
    });
    var $userLink = $('<div>', {
      "class": 'forum-user'
    }).append($('<span>', {
      "class": 'forum-user-link'
    }).append($('<a>', {
      "class": 'mw-userlink userAuthor',
      text: userAuthor,
      href: mw.util.getUrl('User:' + userAuthor)
    }), userLast === userAuthor ? '' : $('<i>', {
      text: '（修改者：' + userLast + '）'
    })));
    var $content = $('<div>', {
      "class": 'forum-content',
      html: content
    });
    var $timeArea = $('<div>', {
      "class": 'post-time'
    }).append($('<i>', {
      "class": 'post-date timePublish',
      text: new Date(timePublish).toLocaleString()
    })); // 楼主

    var $firstThread = $('<div>', {
      "class": 'forum-thread forum-first'
    }).append($('<div>', {
      "class": 'forum-before'
    }).append($('<h3>', {
      "class": 'forum-title',
      text: ctx.meta.title
    }), $idLink, $userLink), $content, $('<div>', {
      "class": 'forum-after'
    }).append($timeArea)); // 普通帖子

    var $normalThread = $('<div>', {
      "class": 'forum-thread'
    }).append($('<div>', {
      "class": 'forum-before'
    }).append($idLink, $userLink), $content, $('<div>', {
      "class": 'forum-after'
    }).append($timeArea, newReplyContainer())); // 判断是否为楼主，并返回帖子容器

    if (id === '1') {
      return $firstThread;
    } else {
      return $normalThread;
    }
  }; // 新回复容器


  var newReplyContainer = function newReplyContainer(ctx) {
    return $('<div>').append($('<p>', {
      text: 'newReplyContainer'
    }));
  }; // 新帖子容器


  var newThreadContainer = function newThreadContainer(ctx) {
    //   var $textArea = $('<textarea>', { class: 'forum-textarea' })
    //   var $submitBtn = $('<button>', {
    //     text: '提交',
    //     class: 'forum-submit-btn',
    //   }).click(function() {
    //     var content = $textArea.val()
    //     if (!content) return
    //     newThread({
    //       forumEl,
    //       forumid,
    //       content,
    //     })
    //   })
    //   var $container = $('<div>', {
    //     class: 'forum-new-thread-area',
    //     'data-debug': JSON.stringify({
    //       forumid,
    //     }),
    //   }).append(
    //     $('<label>', { class: 'forum-input-container' }).append(
    //       $('<div>').append($textArea),
    //       $('<div>').append($submitBtn)
    //     )
    //   )
    return $('<div>').append($('<p>', {
      text: 'newThreadContainer'
    }));
  }; // 新论坛容器


  var newForumContainer = function newForumContainer(ctx) {
    return $('<div>').append($('<p>', {
      text: 'newForumContainer'
    }));
  }; // 无论坛容器


  var noForumContainer = function noForumContainer(ctx) {};

  next && next({
    allForumsContainer: allForumsContainer,
    forumContainer: forumContainer,
    threadContainer: threadContainer
  });
});
/******/ })()
;
//# sourceMappingURL=WikiForum.theme.default.js.map
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
 * @param {jQuery<Element>} ctx.fn.newThreadArea
 * @param {jQuery<Element>} ctx.fn.newReplyArea
 * @param {Object} ctx.meta
 *
 * @param {Function} next
 */
mw.hook('WikiForum.theme').add(function (next) {
  var allForumsContainer = function allForumsContainer(ctx) {
    return $('<div>', {
      "class": 'wiki-forum-all-container'
    });
  };

  var forumContainer = function forumContainer(ctx) {
    return $('<div>', {
      "class": 'wiki-forum',
      'data-forumid': ctx.meta.id
    });
  };

  var firstThread = function firstThread(ctx) {
    return $('<div>', {
      "class": 'forum-thread forum-first'
    }).append($('<div>', {
      "class": 'forum-before'
    }).append($('<h3>', {
      "class": 'forum-title',
      text: ctx.meta.title
    }), $('<span>', {
      "class": 'forum-id-link',
      text: '#' + ctx.meta.id
    }), $('<div>', {
      "class": 'forum-user'
    }).append($('<span>', {
      "class": 'forum-user-link'
    }).append($('<a>', {
      text: ctx.meta.userAuthor,
      href: mw.util.getUrl('User:' + ctx.meta.userAuthor)
    })))), $('<div>', {
      "class": 'forum-content',
      html: ctx.content
    }), $('<div>', {
      "class": 'forum-after'
    }).append($('<i>', {
      "class": 'post-date',
      text: new Date(ctx.meta.timePublish).toLocaleString()
    })), ctx.fn.newThreadArea);
  };

  var normalThread = function normalThread(ctx) {
    return $('<div>', {
      "class": 'forum-thread'
    }).append($('<div>', {
      "class": 'forum-before'
    }).append($('<div>', {
      "class": 'forum-user'
    }).append($('<span>', {
      "class": 'forum-user-link'
    }).append($('<a>', {
      text: ctx.meta.userAuthor,
      href: mw.util.getUrl('User:' + ctx.meta.userAuthor)
    })))), $('<div>', {
      "class": 'forum-content',
      html: ctx.content
    }), $('<div>', {
      "class": 'forum-after'
    }).append($('<i>', {
      "class": 'post-date',
      text: new Date(ctx.meta.timePublish).toLocaleString()
    }), ctx.fn.newReplyArea));
  };

  next && next({
    allForumsContainer: allForumsContainer,
    forumContainer: forumContainer,
    // beforeForum,
    firstThread: firstThread,
    normalThread: normalThread // afterForum,

  });
});
/******/ })()
;
//# sourceMappingURL=WikiForum.theme.default.js.map
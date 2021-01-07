/**
 * @name WikiForum.core
 * @author 机智的小鱼君 <dragon-fish@qq.com>
 * @description Provide a front-end structured discussion page with JavaScript.
 *              Similar to Community Feed and support wikitext.
 *
 * @license MIT
 * @url https://github.com/Wjghj-Project/Gadget-WikiForum
 */

/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./module/actionGet.js":
/*!*****************************!*\
  !*** ./module/actionGet.js ***!
  \*****************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _require = __webpack_require__(/*! ./mw */ "./module/mw.js"),
    api = _require.api,
    conf = _require.conf;

module.exports = function () {
  var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : conf.wgPageName;
  return $.get(api, {
    format: 'json',
    action: 'parse',
    prop: 'text|wikitext',
    page: page
  });
};

/***/ }),

/***/ "./module/log.js":
/*!***********************!*\
  !*** ./module/log.js ***!
  \***********************/
/***/ (function(module) {

function log() {
  var _console;

  for (var _len = arguments.length, data = new Array(_len), _key = 0; _key < _len; _key++) {
    data[_key] = arguments[_key];
  }

  (_console = console).info.apply(_console, ['[WikiForum] [INFO]'].concat(data));
}

function warn() {
  var _console2;

  for (var _len2 = arguments.length, data = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    data[_key2] = arguments[_key2];
  }

  (_console2 = console).warn.apply(_console2, ['[WikiForum] [WARN]'].concat(data));
}

function error() {
  var _console3;

  for (var _len3 = arguments.length, data = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    data[_key3] = arguments[_key3];
  }

  (_console3 = console).error.apply(_console3, ['[WikiForum] [ERR]'].concat(data));
}

module.exports = {
  log: log,
  info: log,
  warn: warn,
  error: error,
  err: error
};

/***/ }),

/***/ "./module/mw.js":
/*!**********************!*\
  !*** ./module/mw.js ***!
  \**********************/
/***/ (function(module) {

module.exports = {
  api: mw.util.wikiScript('api'),
  conf: mw.config.get(),
  editToken: mw.user.tokens.get('editToken'),
  hook: mw.hook,
  util: mw.util
};

/***/ }),

/***/ "./module/parser.js":
/*!**************************!*\
  !*** ./module/parser.js ***!
  \**************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _require = __webpack_require__(/*! ./log */ "./module/log.js"),
    log = _require.log;
/**
 * @function parseForums 从源代码解析可能存在的全部主题
 * @param {Element} code
 * @param {String} title
 */


function parseForums(code, title) {
  var $root = $(code);
  var forums = [];

  if (!$root.hasClass('wiki-forum')) {
    $root = $root.find('.wiki-forum');
  }

  log('开始解析全论坛结构');
  $root.each(function (index, forum) {
    log('单论坛结构', {
      index: index,
      forum: forum
    });
    forums.push({
      id: String(index + 1),
      title: title,
      meta: $(forum).data(),
      threads: parseThreads(forum)
    });
  });
  return forums;
}
/**
 * @function parseThreads 递归全部的帖子
 * @param {Element} forum
 * @param {String} prefix
 */


function parseThreads(forum) {
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var $forum = $(forum);
  if (prefix) prefix += '-';
  var threads = [];
  $threads = getThreads($forum);
  $.each($threads, function (index, thread) {
    var threadObj = {
      id: String(prefix + (index + 1)),
      content: getContent(thread),
      meta: getMeta(thread)
    };

    if (getThreads(thread).length > 0) {
      threadObj.threads = parseThreads(thread, threadObj.id);
    }

    threads.push(threadObj);
  });
  return threads;
}
/**
 * @function getContent 获取帖子可能存在的回复的结构
 * @param {Element} thread
 */


function getThreads(thread) {
  var $thread = $(thread);
  return $thread.find('> .forum-thread');
}
/**
 * @function getContent 获取帖子内容
 * @param {Element} thread
 */


function getContent(thread) {
  var $thread = $(thread);
  var $content = $thread.find('> .forum-content').html() || '';
  return $content;
}
/**
 * @function getMeta 获取帖子的源信息
 * @param {Element} thread
 */


function getMeta(thread) {
  var $thread = $(thread);
  var $data = $thread.data();
  return $data;
}
/**
 * @function getUser 获取帖子发帖者信息
 * @param {Element} thread
 */


function getUser(thread) {
  var $thread = $(thread);
  var author = $thread.data('userAuthor') || '';
  var last = $thread.data('userLast') || author;
  return {
    author: author,
    last: last
  };
}
/**
 * @function getTime 获取帖子发帖时间信息
 * @param {Element} thread
 */


function getTime(thread) {
  var $thread = $(thread);
  var publish = $thread.data('timePublish') || '';
  var modify = $thread.data('timeModify') || publish;
  return {
    publish: publish,
    modify: modify
  };
}
/**
 * @module fromApi 解析 MediaWiki API 返回的信息
 * @param {Object} data 来自 API 的结果：api.php?action=parse&prop=wikitext|text&page=<pageName>
 */


function fromApi(data) {
  log('从 API 结果解析论坛结构');
  var title = data.parse.title;
  var wikitext = data.parse.wikitext['*'];
  var html = data.parse.text['*']; // 防止输出没有根元素

  var $wikitext = $('<div>' + wikitext + '</div>');
  var $html = $('<div>' + html + '</div>'); // 高版本输出自带根元素，低版本没有

  if ($html.find('> .mw-parser-output').length > 0) {
    $html = $html.find('> .mw-parser-output');
  }

  var Obj = {
    wikitext: parseForums($wikitext, title),
    html: parseForums($html, title)
  }; // 缓存全部forum

  window.WikiForum = window.WikiForum || {};
  window.WikiForum.cache = window.WikiForum.cache || {};
  window.WikiForum.cache.pages = window.WikiForum.cache.pages || {};
  window.WikiForum.cache.pages[title] = Obj;
  log('从 API 结果解析完成', Obj);
  return Obj;
}
/**
 * @module fromHtml 从 HTML 源代码解析
 * @param {String|Element} code
 */


function fromHtml(code) {
  var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var $code = $(code);
  var forumEl = parseForums($code);
  log('从 HTML 源代码解析完成', forumEl);
  return forumEl;
}

module.exports = {
  fromApi: fromApi,
  fromHtml: fromHtml
};

/***/ }),

/***/ "./module/renderer.js":
/*!****************************!*\
  !*** ./module/renderer.js ***!
  \****************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _require = __webpack_require__(/*! ./parser */ "./module/parser.js"),
    fromApi = _require.fromApi;

var actionGet = __webpack_require__(/*! ./actionGet */ "./module/actionGet.js");

var _require2 = __webpack_require__(/*! ./mw */ "./module/mw.js"),
    util = _require2.util,
    hook = _require2.hook,
    conf = _require2.conf;

var _require3 = __webpack_require__(/*! ./log */ "./module/log.js"),
    log = _require3.log,
    error = _require3.error; // 获取帖子元素


function getThread(_ref) {
  var forumEl = _ref.forumEl,
      _ref$forumid = _ref.forumid,
      forumid = _ref$forumid === void 0 ? '1' : _ref$forumid,
      threadid = _ref.threadid;
  // 将 id 调整为程序可读的 index
  forumid = Number(forumid);
  forumid--;
  var forum = forumEl[forumid];
  threadid = threadid.split('-');
  $.each(threadid, function (index, item) {
    item = Number(item);
    item--;
    threadid[index] = item;
  }); // 开始递归 threads

  var thread = forum;
  $.each(threadid, function (_, id) {
    log('thread', thread.threads[id]);
    thread = thread.threads[id];
  });
  return thread;
} // 获取帖子内容


function getContent(ctx) {
  var thread = getThread(ctx);
  return thread.content;
} // 获取帖子元信息


function getMeta(ctx) {
  var thread = getThread(ctx);
  return thread.meta;
} // 递归全部主题


function renderAllForums(_ref2) {
  var forumEl = _ref2.forumEl,
      theme = _ref2.theme;
  log('开始渲染全部论坛');
  $root = theme.allForumsContainer();
  $.each(forumEl, function (index, forum) {
    log('递归渲染主题', "".concat(index + 1, "/").concat(forumEl.length));
    $root.append(renderForum({
      _forum: forumEl,
      forumMeta: forum.meta,
      forumid: forum.id,
      forumEl: forum,
      theme: theme
    }), theme.afterAllForums ? theme.afterAllForums() : '');
  });
  return $root;
} // 渲染单个主题


function renderForum(ctx, $root) {
  var forumEl = ctx.forumEl,
      theme = ctx.theme;
  $root = theme.forumContainer({
    meta: forumEl.meta
  });
  renderThread(forumEl, $root);
  if (theme.afterForum) $root.append(theme.afterForum());
  return $root;
}

function renderThread(ctx, $root) {
  var threads = ctx.threads,
      forumid = ctx.forumid;
  $.each(threads, function (index, item) {
    log('递归渲染贴子', {
      forumid: forumid,
      threadid: item.id
    }); // 缓存帖子对象

    var $thread = theme.threadContainer({
      _forum: _forum,
      forumMeta: forumMeta,
      forumid: forumid,
      id: item.id,
      meta: item.meta,
      content: item.content,
      fn: fn
    }); // 如果有回复，处理回复

    if (item.threads && item.threads.length > 0) {
      ctx.forumEl = item;
      $thread.append(renderThread(ctx, $thread));
    }

    $root.append($thread);
  });
}

var fn = {
  parser: __webpack_require__(/*! ./parser */ "./module/parser.js"),
  updater: __webpack_require__(/*! ./updater */ "./module/updater.js")
}; // 从页面加载内容，并渲染到根元素

function fromPage() {
  var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : conf.wgPageName;
  var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '#mw-content-text';
  log('从页面加载信息并渲染', {
    page: page,
    target: target
  });
  actionGet(page).then(function (data) {
    log('成功从 API 获取源代码', page);
    var obj = fromApi(data);
    toPage(obj.html, target);
  }, function (err) {
    error('从 API 获取源代码失败', {
      page: page,
      err: err
    });
  });
} // 渲染返回HTML对象


function toHtml(forumEl) {
  log('渲染并返回 HTML');
  mw.hook('WikiForum.theme').fire(function (theme) {
    return renderAllForums({
      forumEl: forumEl,
      theme: theme
    });
  });
}
/**
 * @module toPage 从 WikiForum-Element 渲染到根元素
 * @param {Object} forumEl WikiForum-Element
 * @param {String|Element} target 渲染的根元素
 */


function toPage(forumEl) {
  var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '#mw-content-text';
  log('准备渲染到页面');
  /**
   * 触发主题函数
   * @param {Functon} theme 返回的主题渲染器
   */

  hook('WikiForum.theme').fire(function (theme) {
    $(target).html(renderAllForums({
      forumEl: forumEl,
      theme: theme
    }));
    log('页面渲染完毕');
    hook('WikiForum.renderer').fire();
  });
}

module.exports = {
  toPage: toPage,
  toHtml: toHtml,
  fromPage: fromPage,
  getContent: getContent,
  getMeta: getMeta
};

/***/ }),

/***/ "./module/updater.js":
/*!***************************!*\
  !*** ./module/updater.js ***!
  \***************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _require = __webpack_require__(/*! ./mw */ "./module/mw.js"),
    conf = _require.conf;

function newThreadStruc(_ref) {
  var meta = _ref.meta,
      content = _ref.content;
  // 将 fooBar 转换为 foo-bar 的形式
  var meta1 = {};
  $.each(meta, function (key, val) {
    key = 'data-' + key.replace(/(.*)([A-Z])(.*)/g, '$1-$2$3').toLowerCase();
    meta1[key] = val;
  });
  meta = meta1;
  return $('<div>', {
    "class": 'forum-thread'
  }).attr(meta).append($('<div>', {
    "class": 'forum-content',
    html: content
  }));
}

function hasThread(thread, id) {
  var res = false;
  if (thread.id === id) ret = true;
  return res;
}

function isComplex() {}

function makeWikitext(obj) {}

function updateThread(_ref2) {
  var forumEl = _ref2.forumEl,
      _ref2$forumid = _ref2.forumid,
      forumid = _ref2$forumid === void 0 ? '1' : _ref2$forumid,
      threadid = _ref2.threadid,
      content = _ref2.content;
  // 将 id 调整为程序可读的 index
  forumid = Number(forumid);
  forumid--;
  var forum = forumEl[forumid];

  function findAndUpdate(_ref3, base) {
    var threadid = _ref3.threadid,
        content = _ref3.content;
    base = base || forum;
    var allThreads = base.threads;
    $.each(allThreads, function (index, item) {
      if (item.id === threadid) {
        item.content = content;
        item.meta.userLast = conf.wgUserName;
        item.meta.timeModify = new Date().toISOString();
      } else if (item.threads) {
        findAndUpdate({
          threadid: threadid,
          content: content
        }, item);
      }
    });
  }

  findAndUpdate({
    threadid: threadid,
    content: content
  });
  return forumEl;
}

function addThread(_ref4) {
  var forumEl = _ref4.forumEl,
      forumid = _ref4.forumid;
  forumid = Number(forumid);
  forumid--;
  var now = new Date();
  var timestamp = now.toISOString();
  forumEl[forumid].threads.push({
    meta: {}
  });
}

function addReply(_ref5) {
  var forumEl = _ref5.forumEl,
      _ref5$forumid = _ref5.forumid,
      forumid = _ref5$forumid === void 0 ? '1' : _ref5$forumid,
      threadid = _ref5.threadid;
}

module.exports = {
  addReply: addReply,
  addThread: addThread,
  updateThread: updateThread // deleteThread,

};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
!function() {
"use strict";
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/**
 * @name WikiForum.core
 * @author 机智的小鱼君 <dragon-fish@qq.com>
 * @url https://github.com/Wjghj-Project/Gadget-WikiForum
 */


var log = __webpack_require__(/*! ./module/log */ "./module/log.js");

var _require = __webpack_require__(/*! ./module/mw */ "./module/mw.js"),
    hook = _require.hook;

mw.loader.using(['mediawiki.api', 'mediawiki.util', 'mediawiki.user'], function () {
  // init global variable
  var Core = {
    parser: __webpack_require__(/*! ./module/parser */ "./module/parser.js"),
    renderer: __webpack_require__(/*! ./module/renderer */ "./module/renderer.js"),
    updater: __webpack_require__(/*! ./module/updater */ "./module/updater.js")
  };
  window.WikiForum = $.extend({}, window.WikiForum, Core);
  hook('WikiForum').fire(Core);
  log.log('Ready!');
});
}();
/******/ })()
;
//# sourceMappingURL=WikiForum.core.js.map
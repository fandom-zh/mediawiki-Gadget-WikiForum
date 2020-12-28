const { fromApi } = require('./parser')
const actionGet = require('./actionGet')
const { util } = require('./mw')
const log = require('./log')

// 获取帖子元素
function getThread({ forumEl, forumid = '1', threadid }) {
  // 将 id 调整为程序可读的 index
  forumid = Number(forumid)
  forumid--
  var forum = forumEl[forumid]

  threadid = threadid.split('-')
  $.each(threadid, (index, item) => {
    item = Number(item)
    item--
    threadid[index] = item
  })

  // 开始递归 threads
  var thread = forum
  $.each(threadid, (_, id) => {
    log.log('thread', thread.threads[id])
    thread = thread.threads[id]
  })

  return thread
}

// 获取帖子内容
function getContent(ctx) {
  var thread = getThread(ctx)
  return thread.content
}

// 获取帖子元信息
function getMeta(ctx) {
  var thread = getThread(ctx)
  return thread.meta
}

// 递归全部主题
function renderAllForums({ forumEl, theme }) {
  $root = theme.allForumsContainer()
  $.each(forumEl, (index, forum) => {
    $root.append(
      renderForum({ _forum: forumEl, forumid: forum.id, forumEl: forum, theme })
    )
  })
  return $root
}

// 渲染单个主题
function renderForum(ctx, $root) {
  var { _forum, forumEl, forumid, theme } = ctx
  var threads = forumEl.threads
  $root = $root || $(theme.forumContainer({ meta: forumEl.meta }))

  var newThreadArea = getNewThreadArea({
    forumEl: _forum,
    forumid: _forum.meta.id,
  })

  $.each(threads, (index, item) => {
    // 缓存帖子对象
    var $thread

    if (index === 0 && forumEl.title) {
      // 楼主
      $thread = theme.firstThread({
        meta: item.meta,
        content: item.content,
        fn: {
          newThreadArea,
          newReplyArea: getNewReplyArea({
            forumEl: _forum,
            forumid,
            threadid: item.id,
          }),
        },
      })
    } else {
      // 一般楼层
      $thread = theme.normalThread({
        meta: item.meta,
        content: item.content,
        fn: {
          newThreadArea,
          newReplyArea: getNewReplyArea({
            forumEl: _forum,
            forumid,
            threadid: item.id,
          }),
        },
      })
    }

    // 如果有回复，处理回复
    if (item.threads && item.threads.length > 0) {
      var ctx1 = ctx
      ctx1.forumEl = item
      $thread.append(renderForum(ctx1, $thread))
    }

    $root.append($thread)
  })

  return $root
}

// 生成回复框
function getNewReplyArea({ forumEl, forumid, threadid }) {
  var $replyBtn = $('<a>', { text: '回复', href: 'javascript:;' })
  var $modifyBtn = $('<a>', { text: '编辑', href: 'javascript:;' })
  var $deleteBtn = $('<a>', { text: '删除', href: 'javascript:;' })
  var $textArea = $('<textarea>', { class: 'forum-textarea' })
  var $submitBtn = $('<button>', {
    text: '提交',
    class: 'forum-submit-btn',
  })

  var $container = $('<div>', {
    class: 'forum-new-reply-area',
    'data-debug': JSON.stringify({
      forumid,
      threadid,
    }),
  }).append(
    $('<div>', { class: 'forum-modify-container' }).append(
      $replyBtn,
      $modifyBtn,
      $deleteBtn
    ),
    $('<label>', { class: 'forum-input-container' }).append(
      $('<div>').append($textArea),
      $('<div>').append($submitBtn)
    )
  )

  return $container
}

// 生成新楼框
function getNewThreadArea({ forumEl, forumid }) {
  var $textArea = $('<textarea>', { class: 'forum-textarea' })
  var $submitBtn = $('<button>', {
    text: '提交',
    class: 'forum-submit-btn',
  }).click(function() {
    var content = $textArea.val()
    if (!content) return
    newThread({
      forumEl,
      forumid,
      content,
    })
  })

  var $container = $('<div>', {
    class: 'forum-new-thread-area',
    'data-debug': JSON.stringify({
      forumid,
    }),
  }).append(
    $('<label>', { class: 'forum-input-container' }).append(
      $('<div>').append($textArea),
      $('<div>').append($submitBtn)
    )
  )

  return $container
}

// 从页面加载内容，并渲染到根元素
function fromPage(page = util.wgPageName, target = '#mw-content-text') {
  log.info('Strat to load page data', page)
  actionGet(page).then(
    data => {
      log.info('Page data ready', page)
      var obj = fromApi(data)
      toPage(obj.html, target)
    },
    err => {
      log.err('Failed to load page data', err)
    }
  )
}

// 渲染返回HTML对象
function toHtml(forumEl) {
  log.log('renderHTML')
  mw.hook('WikiForum.theme').fire(theme => {
    return renderAllForums({ forumEl, theme })
  })
}

/**
 * @module toPage 从 WikiForum-Element 渲染到根元素
 * @param {Object} forumEl WikiForum-Element
 * @param {String|Element} target 渲染的根元素
 */
function toPage(forumEl, target = '#mw-content-text') {
  /**
   * 触发主题函数
   * @param {Object} ctx 传入的上下文
   * @param {Functon} next 返回的主题渲染器
   */
  mw.hook('WikiForum.theme').fire(theme => {
    $(target).html(renderAllForums({ forumEl, theme }))
  })
}

module.exports = {
  toPage,
  toHtml,
  fromPage,
  getContent,
  getMeta,
}

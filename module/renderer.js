const { fromApi } = require('./parser')
const actionGet = require('./actionGet')
const { util, hook, conf } = require('./mw')
const { log, error } = require('./log')

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
    log('thread', thread.threads[id])
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
  log('开始渲染全部论坛')
  $root = theme.allForumsContainer()
  $.each(forumEl, (index, forum) => {
    log('递归渲染主题', `${index + 1}/${forumEl.length}`)
    $root.append(
      renderForum({
        _forum: forumEl,
        forumMeta: forum.meta,
        forumid: forum.id,
        forumEl: forum,
        theme,
      }),
      theme.afterAllForums ? theme.afterAllForums() : ''
    )
  })
  return $root
}

// 渲染单个主题
function renderForum(ctx) {
  log('renderForum ctx', ctx)
  var { _forum, forumEl, forumMeta, forumid, theme } = ctx

  var $root = theme.forumContainer({ meta: forumEl.meta })

  $.each(forumEl.threads, (index, thread) => {
    log('递归渲染贴子', { forumid })
    $root.append(
      renderThread({
        _forum,
        theme,
        thread,
        forumMeta,
        forumid,
      })
    )
  })

  if (theme.afterForum) $root.append(theme.afterForum())

  return $root
}

// 渲染单个帖子
function renderThread(ctx) {
  var { _forum, theme, thread, forumMeta, forumid } = ctx
  log('渲染贴子', { forumid, threadid: thread.id })

  // 缓存帖子对象
  $thread = theme.threadContainer({
    _forum,
    forumMeta,
    forumid,
    id: thread.id,
    meta: thread.meta,
    content: thread.content,
    fn,
  })

  // 如果有回复，处理回复
  if (thread.threads && thread.threads.length > 0) {
    $.each(thread.threads, (index, thread1) => {
      ctx.thread = thread1
      $thread.append(renderThread(ctx))
    })
  }

  return $thread
}

var fn = {
  parser: require('./parser'),
  updater: require('./updater'),
}

// 从页面加载内容，并渲染到根元素
function fromPage(page = conf.wgPageName, target = '#mw-content-text') {
  log('从页面加载信息并渲染', { page, target })
  actionGet(page).then(
    data => {
      log('成功从 API 获取源代码', page)
      var obj = fromApi(data)
      toPage(obj.html, target)
    },
    err => {
      error('从 API 获取源代码失败', { page, err })
    }
  )
}

// 渲染返回HTML对象
function toHtml(forumEl) {
  log('渲染并返回 HTML')
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
  log('准备渲染到页面，等待主题文件……')
  /**
   * 触发主题函数
   * @param {Functon} theme 返回的主题渲染器
   */
  hook('WikiForum.theme').fire(theme => {
    $(target).html(renderAllForums({ forumEl, theme }))
    log('页面渲染完毕')
    hook('WikiForum.renderer').fire()
  })
}

module.exports = {
  toPage,
  toHtml,
  fromPage,
  getContent,
  getMeta,
}

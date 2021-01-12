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
function renderAllForums({ Obj, theme, $root }) {
  log('开始渲染全部论坛')
  const { html } = Obj
  let $allForums = theme.allForumsContainer()

  $.each(html, (index, forum) => {
    log('递归渲染主题', `${index + 1}/${html.length}`)
    $allForums.append(
      renderForum({
        $root,
        _forum: Obj,
        forumMeta: forum.meta,
        forumid: forum.forumid,
        forum,
        theme,
      }),
      theme.afterAllForums
        ? theme.afterAllForums({
            $root,
            $container: $allForums,
            _forum: Obj,
            forumMeta: forum.meta,
            forumid: forum.forumid,
            fn,
          })
        : ''
    )
  })
  return $allForums
}

// 渲染单个主题
function renderForum(ctx) {
  const { $root, $container, _forum, forum, forumMeta, forumid, theme } = ctx

  let $forum = theme.forumContainer({ meta: forumMeta })

  $.each(forum.threads, (index, thread) => {
    $forum.append(
      renderThread({
        $root,
        $container: $forum,
        _forum,
        theme,
        thread,
        forumMeta,
        forumid,
      })
    )
  })

  if (theme.afterForum) {
    $forum.append(
      theme.afterForum({
        $root,
        $container,
        _forum,
        forumMeta,
        forumid,
        fn,
      })
    )
  }

  return $forum
}

// 渲染单个帖子
function renderThread(ctx) {
  const { $root, $container, _forum, theme, thread, forumMeta, forumid } = ctx
  const { content, meta, threadid } = thread

  log('渲染贴子', { forumid, threadid })

  // 缓存帖子对象
  let $thread = theme.threadContainer({
    $root,
    $container,
    _forum,
    forumMeta,
    forumid,
    threadid,
    meta,
    content,
    fn,
  })

  // 如果有回复，处理回复
  if (thread.threads && thread.threads.length > 0) {
    $.each(thread.threads, (index, thread) => {
      ctx.thread = thread
      $thread.append(renderThread(ctx))
    })
  }

  return $thread
}

const fn = {
  parser: require('./parser'),
  updater: require('./updater'),
}

// 从页面加载内容，并渲染到根元素
function fromPage(page = conf.wgPageName, target = '#mw-content-text') {
  actionGet(page).then(
    data => {
      log('成功从 API 获取源代码', page)
      var Obj = fromApi(data)
      toPage(Obj, target)
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
function toPage(Obj, target = '#mw-content-text') {
  log('准备渲染到页面，等待主题文件……')
  /**
   * 触发主题函数
   * @param {Functon} theme 返回的主题渲染器
   */
  hook('WikiForum.theme').fire(theme => {
    const $root = $(target)
    $root.html(renderAllForums({ Obj, theme, $root }))
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

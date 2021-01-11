const { conf } = require('./mw')
const { log } = require('./log')

function newThreadStruc({ meta, content, reply = '' }) {
  // 将 fooBar 转换为 foo-bar 的形式
  $.each(meta, (key, val) => {
    let newKey = key.replace(/(.*)([A-Z])(.*)/g, '$1-$2$3').toLowerCase()
    meta[newKey] = val
    delete meta[key]
  })

  // meta 转换为字符串
  var metaList = []
  $.each(meta, (key, val) => {
    metaList.push(`data-${key}="${val}"`)
  })
  metaList = metaList.join(' ')

  var html = `<!-- thread -->
<div class="forum-thread" ${metaList}>
<div class="forum-content"></div>${reply ? '\n' + reply : ''}
</div>
<!-- /thread -->`

  return html
}

function hasThread(thread, id) {
  var res = false
  if (thread.id === id) ret = true
  return res
}

function isComplex() {}

function makeWikitext(obj) {}

function timeStamp() {
  return new Date().toISOString()
}

/**
 * @function updateThread 编辑内容
 */
function updateThread({ forumEl, forumid = '1', threadid, content }) {
  const { wikitext } = forumEl
  // 将 id 调整为程序可读的 index
  forumid = Number(forumid)
  forumid--
  const forum = wikitext[forumid]

  function findAndUpdate({ threadid, content }, base) {
    var allThreads = base.threads
    $.each(allThreads, (index, item) => {
      if (item.threadid === threadid) {
        item.content = content
        item.meta.userLast = conf.wgUserName
        item.meta.timeModify = timeStamp()
      } else if (item.threads) {
        findAndUpdate({ threadid, content }, item)
      }
    })
  }

  findAndUpdate({ threadid, content }, forum)

  log('Update thread', { forumid, threadid, content })
  handleEdit(wikitext)
}

/**
 * @function addThread 盖新楼，回复楼主
 */
function addThread({ forumEl, forumid, content }) {
  const { wikitext } = forumEl
  forumid = Number(forumid)
  forumid--

  wikitext[forumid].threads.push({
    meta: {
      userAuthor: conf.wgUserName,
      userLast: conf.wgUserName,
      timePublish: timeStamp(),
      timeModify: timeStamp(),
    },
    content,
  })

  log('Add thread', { forumid, content })

  handleEdit(wikitext)
}

/**
 * @function addReply 新回复，回复层主
 */
function addReply({ forumEl, forumid = '1', threadid, content }) {
  const { wikitext } = forumEl
  // 给楼主回复其实就是盖新楼
  if (threadid === '1') {
    return addThread({ forumEl, forumid, content })
  }

  forumid = Number(forumid)
  forumid--

  const forum = wikitext[forumid]

  function findAndUpdate({ threadid, content }, base) {
    var allThreads = base.threads
    $.each(allThreads, (index, item) => {
      if (item.threadid === threadid) {
        item.threads = item.threads || []
        item.threads.push({
          meta: {
            userAuthor: conf.wgUserName,
            userLast: conf.wgUserName,
            timePublish: timeStamp(),
            timeModify: timeStamp(),
          },
          content,
        })
      } else if (item.threads) {
        findAndUpdate({ threadid, content }, item)
      }
    })
  }

  findAndUpdate({ threadid, content }, forum)

  log('Add reply', { forumid, threadid, content })

  handleEdit(wikitext)
}

/**
 * @function handleEdit 将forumEl转换为wikitext并发布
 * @param {Object} forumEl
 */
function handleEdit(forumEl) {
  log('Make edit', forumEl, {
    pageName: forumEl[0].meta.pageName,
    forumsNum: forumEl.length,
  })
}

module.exports = {
  addReply,
  newReply: addReply,
  addThread,
  newThread: addThread,
  updateThread,
  // deleteThread,
}

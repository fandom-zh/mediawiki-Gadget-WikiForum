const { conf } = require('./mw')
const { log, error } = require('./log')
const actionEdit = require('./actionEdit')

/**
 * @module updater 更新器
 *
 * @desc 为了避免老版本 jQuery 的 XSS 漏洞
 *       forumEl -> wikitext 的过程采用 string 拼接的方式
 */

/**
 * @function contentValidator 检查字符串的HTML标签是否匹配，wikitext是否闭合
 * @param {string} str
 */
function contentValidator(str) {
  // Trying to fix wikitext
  var openTable = (str.match(/\{\|/g) || []).length
  var closeTable = (str.match(/\n\|\}/g) || []).length

  for (let i = 0; i < openTable - closeTable; i++) {
    str += '\n|}'
  }

  // fix HTML
  const div = document.createElement('container')
  div.innerHTML = str
  str = div.innerHTML
  return str
}

/**
 * @function handleEdit 处理forumEl并发布
 * @param {import('../types/index').ForumElement[]} forumEl
 */
function handleEdit({ $root, forumEl, summary }) {
  const pageName = forumEl[0].meta.pageName
  const wikitext = parseAllForums(forumEl)

  actionEdit({
    title: pageName,
    text: wikitext,
    summary,
  }).then(
    (ret) => {
      if (ret.error || ret.errors) {
        error(ret.error || ret.errors)
        return
      }
      log('更新论坛成功', ret)
      const { fromPage } = require('./renderer')
      fromPage(pageName, $root)
    },
    (err) => error(err)
  )
}

/**
 * @function parseAllForums
 * @param {import('../types/index').ForumElement[]} forumEl
 */
function parseAllForums(forumEl) {
  var html = ''
  forumEl.forEach((forum) => {
    html += parseForum(forum)
  })

  html = `<!--
 - WikiForum Container
 - 
 - Total Forums: ${forumEl.length}
 - Last modified: ${timeStamp()}
 - Last user: ${conf.wgUserName}
 -
 - DO NOT EDIT DIRECTLY
 -->
${html}

<!-- end WikiForum -->`

  return html
}

/**
 *
 * @param {import('../types/index').ForumElement} forum
 * @returns
 */
function parseForum(forum) {
  const { forumid, meta, threads } = forum
  const metaList = getMeta(meta)

  var threadList = ''
  $.each(threads, (index, thread) => {
    threadList += parseThread(thread)
  })

  const html = `
<!-- start forum#${forumid || 'latest'} -->
<div class="wiki-forum" ${metaList}>
${threadList}
</div>
<!-- end forum#${forumid || 'latest'} -->`

  return html
}

/**
 *
 * @param {import('../types/index').ForumThread} thread
 * @param {*} indent
 * @returns
 */
function parseThread(thread, indent = 0) {
  const { threadid, meta, threads, content } = thread
  const metaList = getMeta(meta)

  var indentStr = ''
  for (let i = 0; i < indent; i++) indentStr += '  '

  var reply = ''
  if (threads && threads.length > 0) {
    $.each(threads, (index, thread) => {
      reply += parseThread(thread, indent + 1)
    })
  }

  var html = `
${indentStr}<!-- start thread#${threadid || 'latest'} -->
${indentStr}<ul class="forum-thread" ${metaList}>
${indentStr}  <li class="forum-content">
<!-- start content -->
${contentValidator(content)}
<!-- end content -->
${indentStr}  </li>${reply}
${indentStr}</ul>
${indentStr}<!-- end thread#${threadid || 'latest'} -->
`

  return html
}

/**
 * @function getMeta 将meta转换为 data-*="" 字符串
 * @param {Record<string, any>} meta jQuery.data()
 * @return {string}
 */
function getMeta(meta) {
  const metaList = []
  $.each(meta, (key, val) => {
    let newKey =
      'data-' + key.replace(/(.*)([A-Z])(.*)/g, '$1-$2$3').toLowerCase()
    metaList.push(`${newKey}="${val}"`)
  })
  return metaList.sort().join(' ')
}

function timeStamp() {
  return new Date().toISOString()
}

function updateThread({
  forumEl,
  forumid = '1',
  threadid,
  content,
  meta = {},
  $root,
}) {
  const { wikitext } = forumEl
  // 将 id 调整为程序可读的 index
  forumid = Number(forumid)
  forumid--
  const forum = wikitext[forumid]

  function findAndUpdate({ threadid, content, meta = {} }, base) {
    var allThreads = base.threads
    $.each(allThreads, (index, item) => {
      if (item.threadid === threadid) {
        if (content) {
          item.content = content
          item.meta.userLast = conf.wgUserName
          item.meta.timeModify = timeStamp()
        }
        if (meta) {
          item.meta = $.extend({}, item.meta, meta)
        }
      } else if (item.threads) {
        findAndUpdate({ threadid, content }, item)
      }
    })
  }

  findAndUpdate({ threadid, meta, content }, forum)

  log('Update thread', { forumid, threadid, content })
  handleEdit({
    $root,
    forumEl: wikitext,
    summary: `[WikiForum] Modify forum#${forumid} > thread#${threadid}`,
  })
}

/**
 * @function addThread 盖新楼，回复楼主
 */
function addThread({ forumEl, forumid, content, $root }) {
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

  handleEdit({
    $root,
    forumEl: wikitext,
    summary: `[WikiForum] Add thread to forum#${forumid}`,
  })
}

/**
 * @function addReply 新回复，回复层主
 */
function addReply({ forumEl, forumid = '1', threadid, content, $root }) {
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

  handleEdit({
    $root,
    forumEl: wikitext,
    summary: `[WikiForum] Add reply to forum#${forumid} > thread#${threadid}`,
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

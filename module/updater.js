const { conf } = require('./mw')

function newThreadStruc({ meta, content }) {
  // 将 fooBar 转换为 foo-bar 的形式
  var meta1 = {}
  $.each(meta, (key, val) => {
    key = 'data-' + key.replace(/(.*)([A-Z])(.*)/g, '$1-$2$3').toLowerCase()
    meta1[key] = val
  })
  meta = meta1

  return $('<div>', { class: 'forum-thread' })
    .attr(meta)
    .append($('<div>', { class: 'forum-content', html: content }))
}

function hasThread(thread, id) {
  var res = false
  if (thread.id === id) ret = true
  return res
}

function isComplex() {}

function makeWikitext(obj) {}

function updateThread({ forumEl, forumid = '1', threadid, content }) {
  // 将 id 调整为程序可读的 index
  forumid = Number(forumid)
  forumid--
  var forum = forumEl[forumid]

  function findAndUpdate({ threadid, content }, base) {
    base = base || forum
    var allThreads = base.threads
    $.each(allThreads, (index, item) => {
      if (item.id === threadid) {
        item.content = content
        item.meta.userLast = conf.wgUserName
        item.meta.timeModify = new Date().toISOString()
      } else if (item.threads) {
        findAndUpdate({ threadid, content }, item)
      }
    })
  }

  findAndUpdate({ threadid, content })

  return forumEl
}

function addThread({ forumEl, forumid }) {
  forumid = Number(forumid)
  forumid--

  var now = new Date()
  var timestamp = now.toISOString()

  forumEl[forumid].threads.push({
    meta: {},
  })
}

function addReply({ forumEl, forumid = '1', threadid }) {}

module.exports = {
  addReply,
  addThread,
  updateThread,
  // deleteThread,
}

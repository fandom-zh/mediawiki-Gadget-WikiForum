const autoLoad = require('./module/autoLoad')

!(() => {
  // init global variable
  window.WikiForum = {
    cache: {
      pages: {},
      avatar: {},
    },
    loadPage: require('./module/loadPage'),
    parser: require('./module/parser'),
  }
  // Auto load
  autoLoad()
})()

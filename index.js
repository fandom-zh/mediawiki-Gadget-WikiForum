/**
 * @name WikiForum.core
 * @author 机智的小鱼君 <dragon-fish@qq.com>
 * @url https://github.com/Wjghj-Project/Gadget-WikiForum
 */
'use strict'

const log = require('./module/log')
const { hook } = require('./module/mw')

mw.loader.using(
  ['mediawiki.api', 'mediawiki.util', 'mediawiki.user'],
  function() {
    // init global variable
    const Core = {
      parser: require('./module/parser'),
      renderer: require('./module/renderer'),
      updater: require('./module/updater'),
    }

    window.WikiForum = $.extend({}, window.WikiForum, Core)
    hook('WikiForum').fire(Core)
    log.log('Ready!')
  }
)

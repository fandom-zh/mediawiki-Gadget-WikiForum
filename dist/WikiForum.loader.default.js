/**
 * @name WikiForum.loader.default
 * @author 机智的小鱼君 <dragon-fish@qq.com>
 * @description Provide a front-end structured discussion page with JavaScript.
 *              Similar to Community Feed and support wikitext.
 *
 * @license MIT
 * @url https://github.com/Wjghj-Project/Gadget-WikiForum
 */

/******/ (function() { // webpackBootstrap
/*!***************************!*\
  !*** ./loader/default.js ***!
  \***************************/
mw.hook('WikiForum').add(function (Core) {
  var loadNS = window.WikiForumNS || [];
  if (typeof loadNS === 'number') loadNS = [loadNS];
  var conf = mw.config.get();

  if (loadNS.includes(conf.wgNamespaceNumber) && $('.wiki-forum').length > 0 && conf.wgArticleId !== 0) {
    Core.renderer.fromPage(conf.wgPageName);
  }
});
/******/ })()
;
//# sourceMappingURL=WikiForum.loader.default.js.map
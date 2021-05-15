const { readdirSync, readFileSync } = require('fs')
const path = require('path')
const { MediaWikiJS } = require('@lavgup/mediawiki.js')

const bot = new MediaWikiJS({
  url: 'https://dev.fandom.com/api.php',
  botUsername: process.env.MW_USERNAME,
  botPassword: process.env.MW_PASSWORD,
})
const pageBase = 'MediaWiki:WikiForum'

// Get files
const pageList = []
function getFile(name) {
  return readFileSync(
    path.resolve(__dirname, '../public/dist', name)
  ).toString()
}

// Push core
pageList.push({
  title: 'core.js',
  content: getFile('core.js'),
})
// Push theme
pageList.push({
  title: 'theme/default.js',
  content: getFile('theme/fandom.js'),
})
// Push loader
readdirSync(path.resolve(__dirname, '../src/loader'))
  .filter((i) => i.endsWith('.js'))
  .map((i) => {
    pageList.push({
      title: `loader/${i}`,
      content: getFile(`loader/${i}`),
    })
  })

function editPage({ title, content }) {
  title = `${pageBase}/${title}`
  return bot.edit({
    title,
    content,
    summary: '[Automatic] Sync from GitHub // 机智的小鱼君@Dev_Wiki_Updater',
  })
}

async function queueEdit(arr, index = 0) {
  const all = arr.length
  const ctx = arr[index]
  if (!ctx) return
  const res = await editPage(ctx)
  console.log(`[${index + 1}/${all}]`, res)
  if (index < arr.length) return queueEdit(arr, index + 1)
}

!(async () => {
  await bot.login()
  await queueEdit(pageList)
  console.log('All done')
})()

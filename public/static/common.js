/**
 * Set copy year
 */
!(() => {
  const from = 2020
  const year = new Date().getFullYear()
  document.getElementById('copyYear').innerText = `${from} - ${year}`
})()

/**
 * Set hljs
 */
!(() => {
  var hlBlock = document.getElementsByClassName('code')
  for (item of hlBlock) {
    hljs.highlightBlock(item)
  }
})()

/**
 * Set minHeight
 */
!(() => {
  window.addEventListener('resize', () => {
    // const clientHeight = window.innerHeight
    // const header = document.getElementsByTagName('header')[0]
    // const main = document.getElementsByTagName('main')[0]
    // const footer = document.getElementsByTagName('footer')[0]
    // main.style.minHeight =
    //   Number(
    //     clientHeight - header.offsetHeight - footer.offsetHeight - 14
    //   ) + 'px'
  })
})()

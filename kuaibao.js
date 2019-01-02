const { Builder, By, Key, until } = require('selenium-webdriver');
const cheerio = require('cheerio')
const NewsCate = require('./models/NewsCate')
const News = require('./models/News')
const sleep = require('./utils/sleep')

// let currentPageNum = 1;
// let maxPageNum = 10;
const baseUrl = 'https://kuaibao.jd.com/'

let cateInfos = []

let driver = new Builder().forBrowser('chrome').build()
let cateLis = null
start()

async function start() {
  await driver.get(baseUrl);
  await driver.executeScript('document.querySelector("#categorys-mini").remove()')
  await driver.executeScript('document.querySelector("#shortcut-2014").remove()')
  cateLis = await driver.findElements(By.css('._3UTyE_Gn2xrh3jkrQR2kXj .pad6DeFCammJHAP7MsOui li'))
  await getCateData()
  console.log(cateInfos)
  for (let i = 0; i < cateInfos.length; i++) {
    let cateInfo = cateInfos[i]
    let cateLi = cateLis[i]
    let hasException = true
    while (hasException) {
      try {
        await cateLi.click()
        hasException = false
        // for (let j = 0; j < 20; j++) {
        //   await sleep(700)
        //   await driver.executeScript('scrollTo(0, document.body.offsetHeight - 1200)')
        // }
      } catch (err) {
        console.log(err.message)
        if (err) hasException = true
      }
    }
    console.log('正在获取索引' + i + '分类id:' + cateInfo.id)
    await getNewsData(i, cateInfo.id)
  }
}

async function getCateData() {
  // 加载首页html
  // let homeHtml = await driver.findElement(By.tagName('html')).getAttribute('innerHTML')
  // let $ = cheerio.load(homeHtml)
  // let firstCateLis = $('._3UTyE_Gn2xrh3jkrQR2kXj .pad6DeFCammJHAP7MsOui li')
  // let firstCateLinks = firstCateLis.children('a')
  for (let i = 0; i < cateLis.length; i++) {
    let cateLi = cateLis[i]
    let cate = await cateLi.getText()
    // console.log(cate)
    let result = await NewsCate.add({ name: cate })
    cateInfos.push(result.dataValues)
  }
}


async function getNewsData(i, cate_id) {
  let newsDataUl = (await driver.findElements(By.css('._3UTyE_Gn2xrh3jkrQR2kXj ._3oESJEbA6EDqNUcNu8namk ul')))[i]
  let $ = cheerio.load(await newsDataUl.getAttribute('innerHTML'))
  for (let index = 0; index < $('._22Oix1ELZz1MDoP6GMIm0F').length; index++) {
    try {
      let item = $('._22Oix1ELZz1MDoP6GMIm0F').get(index)
      let icon = 'https:' + $(item).find('._1ly13xh54Zg8BuvNqyKAZW').data('lazy-src')
      let title = $(item).find('._27CzaCw-p0CS-ah_PEIDAm').data('log-text')
      let description = $(item).find('._3HHIrt8tpulw42bJ1C_C88').text()
      let views = $(item).find('._1xKc-vI6-n3vtpB_wqPm08').text().match(/\d+/)[0]
      let newsInfo = {
        title,
        description,
        icon,
        views,
        cate_id
      }
      // console.log(newsInfo)
      let newsDataLis = await newsDataUl.findElements(By.tagName('li'))
      await newsDataLis[index].click()
      let allHandles = await driver.getAllWindowHandles()
      // console.log(allHandles)
      await driver.switchTo().window(allHandles[allHandles.length - 1])
      // await driver.close()
      // await driver.switchTo().window(allHandles[0])
      let hasException = true
      while (hasException) {
        let content = await driver.findElement(By.css('.yCtYoR9aaUJ6gLLeZpGlr')).getAttribute('innerHTML')
        newsInfo.content = content
        // 校验数据完整
        if ('content' in newsInfo) hasException = false
      }
      // console.log(newsInfo)
      await News.add(newsInfo)
      await driver.close()
      await driver.switchTo().window(allHandles[0])
    } catch (err) {
      console.log(err.message)
    }
  }
}
const { Builder, By, Key, until } = require('selenium-webdriver');
// const { Options } = require('selenium-webdriver/chrome');

// .setChromeOptions(options)

let currentPageNum = 1;
let maxPageNum = 10;
const url = 'https://www.purcotton.com/mall/CommodityList/toCommodityListMgr.ihtml?oprtCatNo=001006'
let driver = new Builder().forBrowser('chrome').build();

start()

async function start() {
  await driver.get(url);
  getData()
}

async function getData() {
  console.log(`正在获取第${currentPageNum}页的数据`)
  let els = await driver.findElements(By.css('#listComm > .item'))
  let results = []
  for (let i = 0; i < els.length; i++) {
    let el = els[i]
    let coverImg = await el.findElement(By.css('.good-img-wrap img')).getAttribute('src')
    let goodsName = await el.findElement(By.css('.good-name .content')).getText()
    let discountPrice = await el.findElement(By.css('.good-price .discount-price')).getText()
    let price = await el.findElement(By.css('.good-price .original-price')).getText()
    console.log(coverImg, goodsName, discountPrice, price)
  }

}
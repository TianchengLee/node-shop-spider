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
  // console.log(await driver.getAllWindowHandles())
  getData()
}

async function getData() {

  console.log(`正在获取第${currentPageNum}页的数据`)
  let els = await driver.findElements(By.css('#listComm > .item'))
  let results = []
  for (let i = 0; i < els.length; i++) {
    try {
      let flag = true
      let el = els[i]
      let cover_img = await el.findElement(By.css('.good-img-wrap img')).getAttribute('src')
      let name = await el.findElement(By.css('.good-name .content')).getText()
      let sale_price = await el.findElement(By.css('.good-price .discount-price')).getText()
      let goodsInfo = {
        cover_img,
        name,
        sale_price,
        price: sale_price,
        cate_id: 1,
        sub_cate_id: 5
      }
      let colorInfo = {}
      let sizeInfo = {}
      let imgInfo = {
        small_imgs: [],
        big_imgs: []
      }

      await el.findElement(By.tagName('a')).click()
      while (flag) {
        let allHandles = await driver.getAllWindowHandles()
        await driver.switchTo().window(allHandles[1])

        // 基本信息获取
        let discount_info = await driver.findElement(By.id('actDivs')).getText()
        let content = await driver.findElement(By.css('.tab-nav .tab-content > .content')).getAttribute('innerHTML')
        let stock = await driver.findElement(By.id('stockId')).getText()
        let sale_count = await driver.findElement(By.id('salesNum')).getText()
        
        // 基本信息绑定
        discount_info && (goodsInfo.discount_info = discount_info)
        content && (goodsInfo.content = content)
        stock && (stock = /\d+/.exec(stock)[0]) && (goodsInfo.stock = stock)
        sale_count && (sale_count = /\d+/.exec(sale_count)[0]) && (goodsInfo.sale_count = sale_count)

        // 图片获取
        let imgs = await driver.findElements(By.css('.goods-magnifier .left .list-img img'))
        console.log(imgs.length)
        imgs.forEach(async img => {
          let smallImg = await img.getAttribute('src')
          // 图片绑定
          if (imgInfo.small_imgs.indexOf(smallImg) === -1) {
            imgInfo.small_imgs.push(smallImg)
            imgInfo.big_imgs.push(smallImg.replace('100x100', '750x600'))
          }
        })

        // 校验数据完整
        if (
          'discount_info' in goodsInfo
          && 'content' in goodsInfo
          && 'stock' in goodsInfo
          && 'sale_count' in goodsInfo
          && imgInfo.small_imgs.length === imgs.length) {
          flag = false
        }

      }
      console.log(goodsInfo)
      console.log(imgInfo)
    } catch (err) {
      console.log('这是catch2')
    }
  }

}
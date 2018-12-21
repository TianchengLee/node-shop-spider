const { Builder, By, Key, until } = require('selenium-webdriver');
const cheerio = require('cheerio')
const Goods = require('./models/Goods')
const GoodsImg = require('./models/GoodsImg')
const GoodsSize = require('./models/GoodsSize')

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

      sale_price && (sale_price = sale_price.substr(1))

      let goodsInfo = {
        cover_img,
        name,
        sale_price,
        price: sale_price,
        cate_id: 1,
        sub_cate_id: 5
      }
      let colorInfos = []
      let sizeInfos = []
      let imgInfo = {
        small_imgs: [],
        big_imgs: []
      }

      await el.findElement(By.tagName('a')).click()
      let allHandles = await driver.getAllWindowHandles()
      await driver.switchTo().window(allHandles[1])

      while (flag) {

        let goodsInfoHTML = await driver.findElement(By.tagName('html')).getAttribute('innerHTML')
        const $ = cheerio.load(goodsInfoHTML)

        let discount_info = $('#actDivs').text()
        let content = $('.tab-nav .tab-content > .content').html()
        let stock = $('#stockId').text()
        let sale_count = $('#salesNum').text()
        let description = $('.goods-msg > .detail').text()

        // 基本信息获取
        // let discount_info = await driver.findElement(By.id('actDivs')).getText()
        // let content = await driver.findElement(By.css('.tab-nav .tab-content > .content')).getAttribute('innerHTML')
        // let stock = await driver.findElement(By.id('stockId')).getText()
        // let sale_count = await driver.findElement(By.id('salesNum')).getText()

        // 基本信息绑定
        description && (goodsInfo.description = description)
        discount_info && (goodsInfo.discount_info = discount_info)
        content && (goodsInfo.content = content)
        stock && (stock = /\d+/.exec(stock)[0]) && (goodsInfo.stock = stock)
        sale_count && (sale_count = /\d+/.exec(sale_count)[0]) && (goodsInfo.sale_count = sale_count)

        // 图片获取
        // let imgs = await driver.findElements(By.css('.goods-magnifier .left .list-img img'))
        // imgs.forEach(async img => {
        let imgs = $('.goods-magnifier .left .list-img img')
        imgs.each((index, img) => {
          // let smallImg = await img.getAttribute('src')
          let smallImg = $(img).attr('src')
          // 图片绑定
          if (imgInfo.small_imgs.indexOf(smallImg) === -1) {
            imgInfo.small_imgs.push(smallImg)
            imgInfo.big_imgs.push(smallImg.replace('100x100', '750x600'))
          }
        })

        // 颜色获取

        let fourText = $('.goods-msg>div').eq(3).text()
        let fiveText = $('.goods-msg>div').eq(4).text()

        if (fourText.includes('颜色')) {
          $('.goods-msg>div').eq(3).find('.dd>a').each((i, item) => {
            colorInfos.push($(item).text().trim())
          })
        }

        // 尺码获取
        if (fiveText.includes('尺码')) {
          $('.goods-msg>div').eq(4).find('.dd>a').each((i, item) => {
            sizeInfos.push($(item).text().trim())
          })
        }

        // 校验数据完整
        if (
          'description' in goodsInfo
          && 'discount_info' in goodsInfo
          && 'content' in goodsInfo
          && 'stock' in goodsInfo
          && 'sale_count' in goodsInfo
          && imgInfo.small_imgs.length === imgs.length) {
          flag = false
        }

      }
      // console.log(goodsInfo)
      // console.log(imgInfo)
      // console.log(colorInfos)
      // console.log(sizeInfos)

      // 插入商品主表
      let goodsResult = await Goods.add(goodsInfo)
      let gid = goodsResult.dataValues.id

      // 插入商品图片表
      await GoodsImg.add(gid, imgInfo)

      // 插入商品尺码表
      await GoodsSize.add(gid, sizeInfos)

      await driver.close()
      await driver.switchTo().window(allHandles[0])

    } catch (err) {
      // console.log(err.message)
    }
  }

}
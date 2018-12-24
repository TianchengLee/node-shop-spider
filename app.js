const { Builder, By, Key, until } = require('selenium-webdriver');
const cheerio = require('cheerio')
const Goods = require('./models/Goods')
const GoodsImg = require('./models/GoodsImg')
const GoodsSize = require('./models/GoodsSize')
const GoodsColor = require('./models/GoodsColor')
const GoodsCate = require('./models/GoodsCate')

// let currentPageNum = 1;
// let maxPageNum = 10;
const baseUrl = 'https://www.purcotton.com/'

// 所有分类信息
let cateInfos = []

let driver = new Builder().forBrowser('chrome').build();

start()

async function start() {
  await driver.get(baseUrl);
  await getCateData()
  for (let i = 0; i < cateInfos.length; i++) {
    let cateInfo = cateInfos[i]
    for (let j = 0; j < cateInfo.children.length; j++) {
      let secondCateInfo = cateInfo.children[j]
      await getGoodsData(cateInfo.id, secondCateInfo)
    }
  }
}

async function getCateData() {
  // 加载首页html
  let homeHtml = await driver.findElement(By.tagName('html')).getAttribute('innerHTML')
  let $ = cheerio.load(homeHtml)
  // 获取一级分类信息
  let firstCateLis = $('.first-menu-wrap > li').slice(2, 6)
  let firstCateLinks = firstCateLis.children('a')
  for (let i = 0; i < firstCateLinks.length; i++) {
    let item = firstCateLinks[i]
    let name = $(item).text()
    // 插入一级分类信息
    let result = await GoodsCate.add({ name, p_cate_id: null })
    let firstCateInfo = result.dataValues
    firstCateInfo.children = []
    // 存储一级分类信息
    cateInfos.push(firstCateInfo)
  }

  // 获取二级分类信息
  let secondCateDivs = firstCateLis.find('.second-menu')
  for (let i = 0; i < secondCateDivs.length; i++) {
    let cateInfo = cateInfos[i]
    let secondCateDiv = secondCateDivs[i]
    let secondCateLinks = $(secondCateDiv).children('a')
    for (let j = 0; j < secondCateLinks.length; j++) {
      let link = secondCateLinks[j]
      let name = $(link).text()
      let p_cate_id = cateInfo.id
      // 插入二级分类信息
      let result = await GoodsCate.add({ name, p_cate_id })
      let secondCateInfo = result.dataValues
      secondCateInfo.url = $(link).attr('href')
      // 存储二级分类信息
      cateInfo.children.push(secondCateInfo)
    }
  }
}

async function getGoodsData(cate_id, cateInfo) {
  await driver.get(cateInfo.url)
  // console.log(`正在获取第${currentPageNum}页的数据`)
  let els = await driver.findElements(By.css('#listComm > .item'))
  for (let i = 0; i < els.length; i++) {
    try {
      let hasException = true
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
        cate_id,
        sub_cate_id: cateInfo.id
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

      while (hasException) {

        let goodsInfoHTML = await driver.findElement(By.tagName('html')).getAttribute('innerHTML')
        const $ = cheerio.load(goodsInfoHTML)
        if (!$('body').text().trim()) {
          hasException = true
          await driver.close()
          await driver.switchTo().window(allHandles[0])
          break
        }

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
          && imgInfo.small_imgs.length === imgs.length
        ) hasException = false


      }
      // console.log(goodsInfo)
      // console.log(imgInfo)
      // console.log(colorInfos)
      // console.log(sizeInfos)

      if (!hasException) {

        // 插入商品主表
        let goodsResult = await Goods.add(goodsInfo)
        let gid = goodsResult.dataValues.id

        // 插入商品图片表
        await GoodsImg.add(gid, imgInfo)

        // 插入商品尺码表
        await GoodsSize.add(gid, sizeInfos)

        // 插入商品颜色表
        await GoodsColor.add(gid, colorInfos)

        await driver.close()
        await driver.switchTo().window(allHandles[0])

      }

    } catch (err) {
      console.log(err.message)
    }
  }

}
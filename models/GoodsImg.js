const Sequelize = require('sequelize')
const sequelize = require('../db')
const config = require('./config')

let GoodsImg = sequelize.define('goods_img', {
  small_img: Sequelize.STRING,
  big_img: Sequelize.STRING,
  gid: Sequelize.INTEGER
}, config.notNeedCtime)

GoodsImg.add = function (gid, imgInfo) {
  return new Promise((resolve, reject) => {
    let { small_imgs, big_imgs } = imgInfo
    if (small_imgs.length === 0) return reject()
    
    for (let i = 0; i < small_imgs.length; i++) {
      let small_img = small_imgs[i]
      let big_img = big_imgs[i]
      this.findOrCreate({
        where: {
          small_img
        },
        defaults: {
          small_img,
          big_img,
          gid
        }
      })
        .spread((goodsImg, created) => {
          resolve(goodsImg)
        })
        .catch(err => {
          reject(err)
        })
    }
  })
}

module.exports = GoodsImg
const Sequelize = require('sequelize')
const sequelize = require('../db')
const config = require('./config')

let Goods = sequelize.define('goods', {
  name: Sequelize.STRING,
  cover_img: Sequelize.STRING,
  description: Sequelize.STRING,
  discount_info: Sequelize.STRING,
  content: Sequelize.TEXT,
  price: Sequelize.INTEGER,
  sale_price: Sequelize.INTEGER,
  stock: Sequelize.INTEGER,
  sale_count: Sequelize.INTEGER,
  cate_id: Sequelize.INTEGER,
  sub_cate_id: Sequelize.INTEGER
}, config)

Goods.add = function (goodsInfo) {
  return new Promise((resolve, reject) => {
    this.findOrCreate({
      where: {
        name: goodsInfo.name
      },
      defaults: goodsInfo
    })
      .spread((goods, created) => {
        resolve(goods)
      })
      .catch(err => {
        reject(err)
      })
  })
}

module.exports = Goods
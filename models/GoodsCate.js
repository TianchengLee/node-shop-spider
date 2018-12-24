const Sequelize = require('sequelize')
const sequelize = require('../db')
const config = require('./config')

let GoodsCate = sequelize.define('goods_cate', {
  name: Sequelize.STRING,
  p_cate_id: Sequelize.INTEGER
}, config.notNeedCtime)

GoodsCate.add = function (cateInfo) {
  if (!cateInfo) return
  return new Promise((resolve, reject) => {
    this.findOrCreate({
      where: {
        name: cateInfo.name,
        p_cate_id: cateInfo.p_cate_id
      },
      defaults: {
        name: cateInfo.name,
        p_cate_id: cateInfo.p_cate_id
      }
    })
      .spread((result, created) => {
        resolve(result)
      })
      .catch(err => {
        reject(err)
      })
  })
}

module.exports = GoodsCate
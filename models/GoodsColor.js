const Sequelize = require('sequelize')
const sequelize = require('../db')
const config = require('./config')

let GoodsColor = sequelize.define('goods_color', {
  color: Sequelize.STRING,
  gid: Sequelize.INTEGER
}, config.notNeedCtime)

GoodsColor.add = function (gid, colorInfos) {
  if (!colorInfos || colorInfos.length === 0) return
  return new Promise((resolve, reject) => {
    for (let i = 0; i < colorInfos.length; i++) {
      let color = colorInfos[i]
      this.findOrCreate({
        where: {
          color,
          gid
        },
        defaults: {
          color,
          gid
        }
      })
        .spread((result, created) => {
          resolve(result)
        })
        .catch(err => {
          reject(err)
        })
    }
  })
}

module.exports = GoodsColor
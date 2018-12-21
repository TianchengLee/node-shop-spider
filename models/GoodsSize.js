const Sequelize = require('sequelize')
const sequelize = require('../db')
const config = require('./config')

let GoodsSize = sequelize.define('goods_size', {
  size: Sequelize.STRING,
  gid: Sequelize.INTEGER
}, config.notNeedCtime)

GoodsSize.add = function (gid, sizeInfos) {
  if (!sizeInfos || sizeInfos.length === 0) return
  return new Promise((resolve, reject) => {
    for (let i = 0; i < sizeInfos.length; i++) {
      let size = sizeInfos[i]
      this.findOrCreate({
        where: {
          size,
          gid
        },
        defaults: {
          size,
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

module.exports = GoodsSize
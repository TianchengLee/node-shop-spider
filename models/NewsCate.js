const Sequelize = require('sequelize')
const sequelize = require('../db')
const config = require('./config')

let NewsCate = sequelize.define('news_cate', {
  name: Sequelize.STRING
}, config.notNeedCtime)

NewsCate.add = function (cateInfo) {
  if (!cateInfo) return
  return new Promise((resolve, reject) => {
    this.findOrCreate({
      where: {
        name: cateInfo.name
      },
      defaults: {
        name: cateInfo.name
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

module.exports = NewsCate
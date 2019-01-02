const Sequelize = require('sequelize')
const sequelize = require('../db')
const config = require('./config')

let News = sequelize.define('news', {
  title: Sequelize.STRING,
  icon: Sequelize.STRING,
  description: Sequelize.STRING,
  content: Sequelize.TEXT,
  views: Sequelize.INTEGER,
  cate_id: Sequelize.INTEGER,
}, config.needCtime)

News.add = function (info) {
  return new Promise((resolve, reject) => {
    this.findOrCreate({
      where: {
        title: info.title,
        icon: info.icon,
      },
      defaults: info
    })
      .spread((result, created) => {
        resolve(result)
      })
      .catch(err => {
        reject(err)
      })
  })
}

module.exports = News
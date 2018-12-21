module.exports = {
  needCtime: {
    timestamps: true,
    createdAt: 'ctime',
    updatedAt: false,
    freezeTableName: true,
  },
  notNeedCtime: {
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    freezeTableName: true,
  }
}
const { DB } = require('./config')

module.exports = {
    client: 'mysql',
    connection: DB,
    migrations: {
      directory: './db/migrations'
    }
  }
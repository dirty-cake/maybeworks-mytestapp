module.exports = {
    client: 'mysql',
    connection: {
      host: 'localhost',
      user: 'root',
      password: '1q2W3e4R%',
      database: 'mwdb'
    },
    migrations: {
      loadExtensions: ['.js'],
      extension: 'js',
      directory: './db/migrations'
    }
  }
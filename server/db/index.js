const Objection = require('objection')
const Knex = require('knex')
const User = require('./models/User.js')

const knex = Knex({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '1q2W3e4R%',
        database: 'mwdb'
    }
})

Objection.Model.knex(knex)

module.exports = {
  User
}
const Objection = require('objection')
const Knex = require('knex')
const User = require('./models/User.js')
const { DB } = require('../config')

const knex = Knex({
    client: 'mysql',
    connection: DB
})

Objection.Model.knex(knex)

module.exports = {
  User
}
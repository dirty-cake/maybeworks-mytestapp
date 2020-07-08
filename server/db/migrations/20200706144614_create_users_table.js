const bcrypt = require('bcrypt')

exports.up = async function(knex) {
    await knex.schema.createTable('users', table => {
        table.increments('id').primary()
        table.string('nickname').unique().notNullable()
        table.string('password').notNullable()
        table.boolean('is_muted').notNullable().defaultTo(false)
        table.boolean('is_banned').notNullable().defaultTo(false)
        table.boolean('is_admin').notNullable().defaultTo(false)
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    })

    await knex('users').insert({
        nickname: 'admin',
        password: bcrypt.hashSync('12345678', 11),
        is_admin: true
    })
}

exports.down = async function(knex) {
    await knex.schema.dropTable('users')
}

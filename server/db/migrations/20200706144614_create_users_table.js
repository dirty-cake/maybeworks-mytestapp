exports.up = async function(knex) {
    await knex.schema.createTable('users', table => {
        table.increments('id').primary()
        table.string('nickname').unique().notNullable()
        table.string('password').notNullable()
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    })
}

exports.down = async function(knex) {
    await knex.schema.dropTable('users')
}

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('drinks', function(table) {
            table.increments('id').primary();
            table.interger('drinkNumber');
            table.integer('userID').unsigned().notNullable().references('id').inTable('users');
        }),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('drinks'),
    ]);
};
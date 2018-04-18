exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('users', function(table) {
            table.increments('id').primary();
            table.string('hash');
            table.string('username');
            table.string('name');
            table.integer('numberCorrect');
            table.integer('drinkIndex');
        }),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('users'),
    ]);
};
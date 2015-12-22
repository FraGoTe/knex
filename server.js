var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(3030);

var knex = require('./lib/index')({
  dialect: 'firebird',
  connection: {
    host     : '127.0.0.1',
    user     : 'SYSDBA',
    password : 'masterkey',
    database : 'D:/data/lnag/SIE.FDB'
  }
});
/**
 * 
options.host = '127.0.0.1';
options.port = 3050;
options.database = 'database.fdb';
options.user = 'SYSDBA';
options.password = 'masterkey';
 */

// Create a table
knex.schema
.dropTableIfExists('accounts')
.dropTableIfExists('users')
.createTable('users', function(table) {
  table.increments('id');
  table.string('user_name');
})

// ...and another
.createTable('accounts', function(table) {
  table.increments('id');
  table.string('account_name');
  table.integer('user_id').references('users.id');
})

// Then query the table...
.then(function() {
  return knex.insert({user_name: 'Tim', id: 1}).into('users');
})

// ...and using the insert id, insert into the other table.
.then(function(rows) {
  return knex.table('accounts').insert({account_name: 'knex', user_id: rows[0]});
})

// Query both of the rows.
.then(function() {
  return knex('users')
    .join('accounts', 'users.id', 'accounts.user_id')
    .select('users.user_name as user', 'accounts.account_name as account');
})

// .map over the results
.map(function(row) {
  console.log(row);
})

// Finally, add a .catch handler for the promise chain
.catch(function(e) {
  console.error(e);
});
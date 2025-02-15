import type { Knex } from 'knex';

export const up = (knex: Knex) => {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').unique().primary();
    table.string('username', 22).unique().notNullable();
    table.string('email', 100).unique().notNullable();
    table.string('password_hash').notNullable();
    table.boolean('confirmed').defaultTo(false);
    table.timestamps(true, true);
  });
};

export const down = (knex: Knex) => {
  return knex.schema.dropTableIfExists('users');
};

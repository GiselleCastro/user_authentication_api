import type { Knex } from 'knex';

export const up = (knex: Knex) => {
  return knex.schema.createTable('permissions', (table) => {
    table.uuid('id').unique().primary();
    table.string('permission', 50).unique().notNullable();
    table.string('description').notNullable();
    table.timestamps(true, true);
  });
};

export const down = (knex: Knex) => {
  return knex.schema.dropTableIfExists('permissions');
};

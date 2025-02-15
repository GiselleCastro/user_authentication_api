import type { Knex } from 'knex';

export const up = (knex: Knex) => {
  return knex.schema.createTable('users_roles', (table) => {
    table.uuid('user_id').unique().notNullable();
    table
      .foreign('user_id')
      .references('users.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.uuid('role_id').notNullable();
    table
      .foreign('role_id')
      .references('roles.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.primary(['user_id', 'role_id']);
    table.timestamps(true, true);
  });
};

export const down = (knex: Knex) => {
  return knex.schema.dropTableIfExists('users_roles');
};

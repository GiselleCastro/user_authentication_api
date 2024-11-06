import type { Knex } from "knex";

export const up = (knex: Knex) => {
  return knex.schema.createTable("status_user", (table) => {
    table.uuid("id").primary();
    table.string("status", 20).unique().notNullable();
    table.string("description").notNullable();
    table.timestamps(true, true);
  });
};

export const down = (knex: Knex) => {
  return knex.schema.dropTableIfExists("status_user");
};

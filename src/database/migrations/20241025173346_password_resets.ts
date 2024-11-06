import type { Knex } from "knex";

export const up = (knex: Knex) => {
  return knex.schema.createTable("password_resets", (table) => {
    table.string("login").notNullable();
    table.string("token").notNullable();
    table.timestamps(true, true);
  });
};

export const down = (knex: Knex) => {
  return knex.schema.dropTableIfExists("password_resets");
};

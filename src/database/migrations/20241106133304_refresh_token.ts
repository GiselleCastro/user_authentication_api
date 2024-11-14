import type { Knex } from "knex";

export const up = (knex: Knex) => {
  return knex.schema.createTable("refresh_tokens", (table) => {
    table.uuid("id").unique().primary();
    table.uuid("user_id").notNullable();
    table
      .foreign("user_id")
      .references("users.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("refresh_token_hash").notNullable();
    table.dateTime("expires_in").notNullable();
    table.timestamps(true, true);
  });
};

export const down = (knex: Knex) => {
  return knex.schema.dropTableIfExists("refresh_tokens");
};

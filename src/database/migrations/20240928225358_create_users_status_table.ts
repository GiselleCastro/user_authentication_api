import type { Knex } from "knex";

export const up = (knex: Knex) => {
  return knex.schema.createTable("users_status", (table) => {
    table.string("user_id", 20).unique().notNullable();
    table
      .foreign("user_id")
      .references("users.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("status_id", 20).notNullable();
    table
      .foreign("status_id")
      .references("status.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.primary(["user_id", "status_id"]);
    table.timestamps(true, true);
  });
};

export const down = (knex: Knex) => {
  return knex.schema.dropTableIfExists("users_status");
};

import type { Knex } from "knex";

export const up = (knex: Knex) => {
  return knex.schema.createTable("permissions_roles", (table) => {
    table.uuid("permission_id").notNullable();
    table
      .foreign("permission_id")
      .references("permissions.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.uuid("role_id").notNullable();
    table
      .foreign("role_id")
      .references("roles.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.primary(["permission_id", "role_id"]);
    table.timestamps(true, true);
  });
};

export const down = (knex: Knex) => {
  return knex.schema.dropTableIfExists("permissions_roles");
};

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    create table users(
      id serial primary key,
      created_at timestamp not null default current_timestamp,
      first_name varchar(64) not null,
      last_name varchar(64),
      login varchar(64) not null,
      password varchar(128),
      email varchar(320) not null, 
      is_active boolean not null default true,
      is_verified boolean not null default false
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}

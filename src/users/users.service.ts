import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX } from 'src/core/infra/databases/postgres/constants/postgres';
import { CreateUserDTO } from './dtos/createUserDTO';
import { User } from './types/user';

@Injectable()
export class UsersService {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async createUser(data: CreateUserDTO): Promise<User> {
    const [user]: User[] = await this.knex('users')
      .insert({
        first_name: data.first_name,
        last_name: data.last_name,
        login: data.login,
        password: data.password,
        email: data.email,
        is_verified: data.is_verified,
      })
      .returning('*');

    return user;
  }

  async getUserByLogin(login: string): Promise<User | null> {
    const user: User = await this.knex('users')
      .select('*')
      .where('login', '=', login)
      .orWhere('email', '=', login)
      .andWhere('is_active', '=', true)
      .first();

    return user;
  }

  async makeUserVerified(id: string): Promise<void> {
    await this.knex
      .update({ is_verified: true })
      .where({ id, is_active: true });
  }

  async getUserById(id: string): Promise<User> {
    const user: User = await this.knex('users')
      .select('*')
      .where({ id, is_active: true })
      .first();

    return user;
  }
}

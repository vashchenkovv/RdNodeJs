import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  getAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOntByID(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findOntByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async deleteUser(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async addUser(user: Pick<User, 'name' | 'email'>): Promise<User> {
    const existUser = await this.findOntByEmail(user.email);
    if (existUser) return existUser;

    const newUser = this.usersRepository.create({
      name: user.name,
      email: user.email,
    });

    return this.usersRepository.save(newUser);
  }

  async updateUser(
    id: string,
    user: Pick<User, 'name' | 'email'>,
  ): Promise<User> {
    const existUser = await this.findOntByID(id);
    if (!existUser) throw new NotFoundException(`User not exists`);
    existUser.name = user.name;
    existUser.email = user.email;
    return this.usersRepository.save(existUser);
  }
}
